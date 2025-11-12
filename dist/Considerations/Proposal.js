"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Proposal = void 0;
class Proposal {
    /**
     * @param id
     * @param cons
     * @param act
     * @param eligibilities Optional eligibility hard-gates. If null/empty, always eligible.
     */
    constructor(id, cons, act, eligibilities) {
        /** base tendency for this action (0..1) */
        this.prior = 1.0;
        /** >1 = sharper/stricter, <1 = flatter */
        this.temperature = 1.0;
        this.noRepeat = false;
        this.id = id;
        // Make defensive copies and freeze to emulate IReadOnlyList
        this.considerations = Object.freeze([...cons]);
        this.act = act;
        this.eligibilities = Object.freeze([...(eligibilities !== null && eligibilities !== void 0 ? eligibilities : [])]);
    }
    static clamp01(x) {
        return Math.min(1, Math.max(0, x));
    }
    isEligible(rt) {
        return this.eligibilities.length === 0 || this.eligibilities.every(e => e.isEligible(rt));
    }
    /**
     * Multiply utilities (geometric mean of considerations) with epsilon protection.
     */
    utility(rt) {
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
exports.Proposal = Proposal;
Proposal.EPS = 1e-6;
