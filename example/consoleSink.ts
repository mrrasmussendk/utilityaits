import { Proposal } from "../src/Considerations/Proposal";
import {OrchestrationSink, OrchestrationStopReason, ScoredProposal} from "../src/Orchestration/OrchestrationSink";
import {Runtime} from "../src/Utils/Runtime";

export class ConsoleSink implements OrchestrationSink {
    onTickStart(rt: Runtime): void {
        console.log(`\nTick ${rt.tick}`);
    }

    onScored(_rt: Runtime, scored: ReadonlyArray<ScoredProposal>): void {
        for (const s of scored) {
            console.log(`  candidate ${s.proposal.id} -> utility=${s.utility.toFixed(3)}`);
        }
    }

    onChosen(_rt: Runtime, chosen: Proposal, utility: number): void {
    console.log(`  chosen: ${chosen.id} (${utility.toFixed(3)})`);
  }

  onActed(_rt: Runtime, chosen: Proposal): void {
    console.log(`  acted: ${chosen.id}`);
  }

  onStopped(rt: Runtime, reason: OrchestrationStopReason): void {
    console.log(`Stopped at tick ${rt.tick} because: ${reason}`);
  }
}
