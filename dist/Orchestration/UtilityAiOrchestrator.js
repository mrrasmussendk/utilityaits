"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UtilityAiOrchestrator = void 0;
const IStack_1 = require("./Stack/IStack");
const EventBus_1 = require("../Utils/EventBus");
const SelectionStrategy_1 = require("./SelectionStrategy");
const OrchestrationSink_1 = require("./OrchestrationSink");
const StopOrchestrationEvent_1 = require("./Events/StopOrchestrationEvent");
class UtilityAiOrchestrator {
    constructor() {
        this.sensors = [];
        this.modules = [];
        this._executionStack = new IStack_1.Stack();
        this._stopAtZero = true;
        this._selectionStrategy = new SelectionStrategy_1.MaxUtilitySelection();
        this.bus = new EventBus_1.EventBus();
    }
    AddSensor(sensor) {
        this.sensors.push(sensor);
        return this;
    }
    AddModule(m) {
        this.modules.push(m);
        return this;
    }
    runAsync(intent, maxTricks, as, sink) {
        return __awaiter(this, void 0, void 0, function* () {
            if (sink == null) {
                sink = OrchestrationSink_1.NullSink.instance;
            }
            for (let i = 0; i < maxTricks; i++) {
                const rt = { bus: this.bus, intent, tick: i };
                sink.onTickStart(rt);
                yield this.senseAsyncAll(rt);
                if (this.TryStopFromSensors(rt, sink))
                    return;
                let proposals = this.GatherProposalsOrStop(rt, sink);
                if (proposals == null)
                    return;
                var scored = this.ScoreProposalsAndNotify(rt, proposals, sink);
                var chosen = this.ChooseAndMaybeStopAtZero(rt, scored, sink);
                if (chosen == null)
                    return;
                yield this.actAsync(chosen.chosen, as, sink, rt);
            }
            let finalRt = { bus: this.bus, intent, tick: maxTricks };
            sink.onStopped(finalRt, OrchestrationSink_1.OrchestrationStopReason.MaxTicksReached);
            return Promise.resolve(undefined);
        });
    }
    actAsync(proposal, ct, sink, rt) {
        return __awaiter(this, void 0, void 0, function* () {
            yield proposal.act(ct);
            sink.onActed(rt, proposal);
        });
    }
    senseAsyncAll(rt) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const s of this.sensors) {
                yield s.senseAsync(rt);
            }
        });
    }
    GatherProposalsOrStop(rt, sink) {
        let all = [];
        for (let i = 0; i < this.modules.length; i++) {
            const proposals = this.modules[i].propose(rt);
            if (proposals && proposals.length > 0) {
                all.push(...proposals);
            }
        }
        if (all.length == 0) {
            sink.onStopped(rt, OrchestrationSink_1.OrchestrationStopReason.NoProposals);
            return null;
        }
        var eligible = all.filter(p => p.isEligible(rt));
        if (eligible.length == 0) {
            sink.onStopped(rt, OrchestrationSink_1.OrchestrationStopReason.NoEligibleProposals);
            return null;
        }
        return eligible;
    }
    ScoreProposalsAndNotify(rt, proposals, sink) {
        const scored = proposals
            .map((p) => ({ proposal: p, utility: p.utility(rt) }))
            .sort((a, b) => b.utility - a.utility);
        sink.onScored(rt, scored);
        return scored;
    }
    TryStopFromSensors(rt, sink) {
        const stopEvt = rt.bus.getOrDefault(StopOrchestrationEvent_1.STOP_ORCHESTRATION_EVENT);
        if (!stopEvt)
            return false;
        sink.onStopped(rt, stopEvt.reason);
        return true;
    }
    ChooseAndMaybeStopAtZero(rt, scored, sink) {
        let chosen = { chosen: scored[0].proposal, score: scored[0].utility };
        if (chosen.score <= 0 && this._stopAtZero) {
            sink.onStopped(rt, OrchestrationSink_1.OrchestrationStopReason.ZeroUtility);
            return null;
        }
        sink.onChosen(rt, chosen.chosen, chosen.score);
        return chosen;
    }
}
exports.UtilityAiOrchestrator = UtilityAiOrchestrator;
