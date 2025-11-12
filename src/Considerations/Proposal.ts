import {Consideration} from "./Consideration";
import {Eligibility} from "./Eligibility";
import {Runtime} from "../Utils/Runtime";
export type ActFn = (ct: AbortSignal) => Promise<void>;

export class Proposal {
    public readonly id: string;
    public readonly considerations: ReadonlyArray<Consideration>;
    public readonly eligibilities: ReadonlyArray<Eligibility>;
    public readonly act: ActFn;

    /** base tendency for this action (0..1) */
    public prior: number = 1.0;

    /** >1 = sharper/stricter, <1 = flatter */
    public temperature: number = 1.0;

    public static readonly EPS = 1e-6;

    public noRepeat: boolean = false;
    public jsonOutput?: string;

    /**
     * @param id
     * @param cons
     * @param act
     * @param eligibilities Optional eligibility hard-gates. If null/empty, always eligible.
     */
    constructor(
        id: string,
        cons: ReadonlyArray<Consideration>,
        act: ActFn,
        eligibilities?: ReadonlyArray<Eligibility>
    ) {
        this.id = id;
        // Make defensive copies and freeze to emulate IReadOnlyList
        this.considerations = Object.freeze([...cons]);
        this.act = act;
        this.eligibilities = Object.freeze([...(eligibilities ?? [])]);
    }

    private static clamp01(x: number): number {
        return Math.min(1, Math.max(0, x));
    }

    public isEligible(rt: Runtime): boolean {
        return this.eligibilities.length === 0 || this.eligibilities.every(e => e.isEligible(rt));
    }

    /**
     * Multiply utilities (geometric mean of considerations) with epsilon protection.
     */
    public utility(rt: Runtime): number {
        // Prior/bias in [0,1], protected from complete annihilation by epsilon
        const prior = Math.max(Proposal.clamp01(this.prior), Proposal.EPS);

        // Handle the no-considerations case: utility equals prior
        if (this.considerations.length === 0) {
            return Proposal.clamp01(prior);
        }

        // Accumulate consideration values in log-space for geometric mean
        let sumLog = 0.0;
        let count = 0;

        for (const c of this.considerations) {
            const v = Math.max(Proposal.clamp01(c.evaluate(rt)), Proposal.EPS);
            sumLog += Math.log(v);
            count++;
        }

        // Geometric mean of considerations in (0,1]
        const geom = Math.exp(sumLog / Math.max(1, count));
        const gamma = Math.max(this.temperature, Proposal.EPS);

        // Final utility: prior times tempered geometric mean of considerations
        const utility = prior * Math.pow(geom, gamma);

        return Proposal.clamp01(utility);
    }
}