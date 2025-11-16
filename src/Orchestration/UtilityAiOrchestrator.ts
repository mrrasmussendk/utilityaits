import {Orchestrator} from "./Orchestrator";
import {UserIntent} from "../Utils/UserIntent";
import {Sensor} from "../Sensors/Sensor";
import {CapabilityModule} from "../Capabilities/CapabilityModule";
import {Stack} from "./Stack/IStack";
import {EventBus} from "../Utils/EventBus";
import {MaxUtilitySelection, SelectionStrategy} from "./SelectionStrategy";
import {NullSink, OrchestrationSink, OrchestrationStopReason} from "./OrchestrationSink";
import {Runtime} from "../Utils/Runtime";
import {Proposal} from "../Considerations/Proposal";
import {STOP_ORCHESTRATION_EVENT, StopOrchestrationEvent} from "./Events/StopOrchestrationEvent";

export class UtilityAiOrchestrator implements Orchestrator {

    private readonly sensors: Sensor[] = [];
    private readonly modules: CapabilityModule[] = [];
    private readonly _executionStack: Stack<string> = new Stack<string>();
    private readonly _stopAtZero: boolean = true;
    private readonly _selectionStrategy: SelectionStrategy = new MaxUtilitySelection();
    private bus: EventBus = new EventBus();


    public AddSensor(sensor: Sensor): UtilityAiOrchestrator {
        this.sensors.push(sensor);
        return this;
    }

    public AddModule(m: CapabilityModule): UtilityAiOrchestrator {
        this.modules.push(m);
        return this;
    }

    async runAsync(intent: UserIntent, maxTricks: number, as: AbortSignal, sink?: OrchestrationSink): Promise<void> {
        if (sink == null) {
            sink = NullSink.instance;
        }

        for (let i = 0; i < maxTricks; i++) {
            const rt: Runtime = {bus: this.bus, intent, tick: i};
            sink.onTickStart(rt);

            await this.senseAsyncAll(rt);
            if (this.TryStopFromSensors(rt, sink)) return;

            let proposals = this.GatherProposalsOrStop(rt, sink);
            if (proposals == null) return;

            var scored = this.ScoreProposalsAndNotify(rt, proposals, sink);
            var chosen = this.ChooseAndMaybeStopAtZero(rt, scored, sink);
            if (chosen == null) return;
            await this.actAsync(chosen.chosen, as, sink, rt);

        }
        let finalRt = {bus: this.bus, intent, tick: maxTricks}

        sink.onStopped(finalRt, OrchestrationStopReason.MaxTicksReached);
        return Promise.resolve(undefined);
    }

    private async actAsync(proposal: Proposal, ct: AbortSignal, sink: OrchestrationSink, rt: Runtime) {
        await proposal.act(ct);
        sink.onActed(rt, proposal)
    }

    private async senseAsyncAll(rt: Runtime) {
        for (const s of this.sensors) {
            await s.senseAsync(rt);
        }
    }


    private GatherProposalsOrStop(rt: Runtime, sink: OrchestrationSink): Array<Proposal> | null {
        let all: Array<Proposal> = []
        for (let i = 0; i < this.modules.length; i++) {
            const proposals = this.modules[i].propose(rt);
            if (proposals && proposals.length > 0) {
                all.push(...proposals);
            }
        }
        if (all.length == 0) {
            sink.onStopped(rt, OrchestrationStopReason.NoProposals);
            return null
        }

        var eligible = all.filter(p => p.isEligible(rt));
        if (eligible.length == 0) {
            sink.onStopped(rt, OrchestrationStopReason.NoEligibleProposals);
            return null;
        }

        return eligible;
    }


    private ScoreProposalsAndNotify(rt: Runtime, proposals: Array<Proposal>, sink: OrchestrationSink): Array<{
        proposal: Proposal,
        utility: number
    }> {
        const scored = proposals
            .map((p) => ({proposal: p, utility: p.utility(rt)}))
            .sort((a, b) => b.utility - a.utility);
        sink.onScored(rt, scored);
        return scored;
    }

    private TryStopFromSensors(rt: Runtime, sink: OrchestrationSink): boolean {
        const stopEvt = rt.bus.getOrDefault<StopOrchestrationEvent>(STOP_ORCHESTRATION_EVENT);
        if (!stopEvt) return false;

        sink.onStopped(rt, stopEvt.reason);
        return true;
    }

    private ChooseAndMaybeStopAtZero(rt: Runtime, scored: Array<{
        proposal: Proposal,
        utility: number
    }>, sink: OrchestrationSink): { chosen: Proposal, score: Number } | null {

        let chosen = {chosen: scored[0].proposal, score: scored[0].utility};
        if (chosen.score <= 0 && this._stopAtZero) {
            sink.onStopped(rt, OrchestrationStopReason.ZeroUtility);
            return null;
        }
        sink.onChosen(rt, chosen.chosen, chosen.score);
        return chosen;

    }
}