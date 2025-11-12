import {Proposal} from "../Considerations/Proposal";
import {Runtime} from "../Utils/Runtime";

/**
 * Explains why the orchestrator stopped executing ticks.
 */
export enum OrchestrationStopReason {
    /** No capability module produced any Proposal for the current tick. */
    NoProposals = "NoProposals",

    /** Capability modules produced proposals but none were eligible for this tick. */
    NoEligibleProposals = "NoEligibleProposals",

    /** The chosen proposal's utility evaluated to zero and StopAtZero was enabled. */
    ZeroUtility = "ZeroUtility",

    /** The orchestrator executed the configured maximum number of ticks. */
    MaxTicksReached = "MaxTicksReached",

    /** The provided CancellationToken was signaled. */
    Cancelled = "Cancelled",

    GoalAchieved = "GoalAchieved",
    SensorRequestedStop = "SensorRequestedStop",
}

/**
 * Utility score computed for a proposal within a tick.
 */
export type ScoredProposal = {
    proposal: Proposal;
    utility: number; // 0..1
};

/**
 * A snapshot of one decision tick: scored candidates, the chosen proposal and its utility.
 */
export interface OrchestrationTick {
    /** Tick index starting from zero. */
    tick: number;

    /** All candidates with their computed utility for this tick. */
    scored: ReadonlyArray<ScoredProposal>;

    /** The proposal selected by the selection strategy. */
    chosen: Proposal;

    /** Utility of the chosen proposal (0..1). */
    chosenUtility: number;
}

/**
 * Observer/telemetry sink for the orchestrator lifecycle. Implementations can log, record,
 * export metrics, or build a report without affecting control flow.
 */
export interface OrchestrationSink {
    /** Called at the start of each tick after creating the Runtime. */
    onTickStart(rt: Runtime): void;

    /** Called after proposals have been evaluated to utilities for this tick. */
    onScored(rt: Runtime, scored: ReadonlyArray<ScoredProposal>): void;

    /** Called with the selected Proposal and its utility. */
    onChosen(rt: Runtime, chosen: Proposal, utility: number): void;

    /** Called after the chosen proposal's action has completed. */
    onActed(rt: Runtime, chosen: Proposal): void;

    /** Called exactly once when the orchestrator stops and indicates the reason. */
    onStopped(rt: Runtime, reason: OrchestrationStopReason): void;
}

/**
 * Default no-op sink. Use when you do not need any output or logging.
 */
export class NullSink implements OrchestrationSink {
    /** A single reusable instance. */
    public static readonly instance = new NullSink();

    private constructor() {
    }

    onTickStart(_rt: Runtime): void {
    }

    onScored(_rt: Runtime, _scored: ReadonlyArray<ScoredProposal>): void {
    }

    onChosen(_rt: Runtime, _chosen: Proposal, _utility: number): void {
    }

    onActed(_rt: Runtime, _chosen: Proposal): void {
    }

    onStopped(_rt: Runtime, _reason: OrchestrationStopReason): void {
    }
}

/**
 * Fan-out sink that forwards all events to multiple sinks.
 */
export class CompositeSink implements OrchestrationSink {
    private readonly sinks: ReadonlyArray<OrchestrationSink>;

    /** Create a composite forwarding to the provided sinks in order. */
    constructor(...sinks: OrchestrationSink[]) {
        this.sinks = sinks;
    }

    onTickStart(rt: Runtime): void {
        for (const s of this.sinks) s.onTickStart(rt);
    }

    onScored(rt: Runtime, scored: ReadonlyArray<ScoredProposal>): void {
        for (const s of this.sinks) s.onScored(rt, scored);
    }

    onChosen(rt: Runtime, chosen: Proposal, utility: number): void {
        for (const s of this.sinks) s.onChosen(rt, chosen, utility);
    }

    onActed(rt: Runtime, chosen: Proposal): void {
        for (const s of this.sinks) s.onActed(rt, chosen);
    }

    onStopped(rt: Runtime, reason: OrchestrationStopReason): void {
        for (const s of this.sinks) s.onStopped(rt, reason);
    }
}

/**
 * Simple in-memory sink that records per-tick decisions for later inspection (tests, debugging, reports).
 */
export class RecordingSink implements OrchestrationSink {
    private readonly _ticks: OrchestrationTick[] = [];
    private _lastScored: ReadonlyArray<ScoredProposal> = Object.freeze([]);

    /** Immutable list of recorded ticks in order. */
    get ticks(): ReadonlyArray<OrchestrationTick> {
        return this._ticks;
    }

    /** @inheritdoc */
    onTickStart(_rt: Runtime): void {
        this._lastScored = Object.freeze([]);
    }

    /** @inheritdoc */
    onScored(_rt: Runtime, scored: ReadonlyArray<ScoredProposal>): void {
        // Copy to avoid future mutation issues
        this._lastScored = Object.freeze(scored.map(sp => ({...sp})));
    }

    /** @inheritdoc */
    onChosen(rt: Runtime, chosen: Proposal, utility: number): void {
        this._ticks.push({
            tick: rt.tick,           // assuming Runtime exposes a 'tick' number like the C# version
            scored: this._lastScored,
            chosen,
            chosenUtility: utility,
        });
    }

    /** @inheritdoc */
    onActed(_rt: Runtime, _chosen: Proposal): void {
    }

    /** @inheritdoc */
    onStopped(_rt: Runtime, _reason: OrchestrationStopReason): void {
    }
}
