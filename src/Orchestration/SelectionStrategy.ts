import {Proposal} from "../Considerations/Proposal";

export interface SelectionStrategy {
    select(scored: Array<{P:Proposal, utility: number}>): Proposal;
}
export class MaxUtilitySelection implements  SelectionStrategy{
    select(scored: Array<{P:Proposal, utility: number}>): Proposal {
        if (scored.length == 0) throw new Error("No proposals to select from.");
        // Assuming scored is already ordered desc by utility
        return scored[0].P;
    }
}