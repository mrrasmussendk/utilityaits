"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordingSink = exports.CompositeSink = exports.NullSink = exports.OrchestrationStopReason = void 0;
/**
 * Explains why the orchestrator stopped executing ticks.
 */
var OrchestrationStopReason;
(function (OrchestrationStopReason) {
    /** No capability module produced any Proposal for the current tick. */
    OrchestrationStopReason["NoProposals"] = "NoProposals";
    /** Capability modules produced proposals but none were eligible for this tick. */
    OrchestrationStopReason["NoEligibleProposals"] = "NoEligibleProposals";
    /** The chosen proposal's utility evaluated to zero and StopAtZero was enabled. */
    OrchestrationStopReason["ZeroUtility"] = "ZeroUtility";
    /** The orchestrator executed the configured maximum number of ticks. */
    OrchestrationStopReason["MaxTicksReached"] = "MaxTicksReached";
    /** The provided CancellationToken was signaled. */
    OrchestrationStopReason["Cancelled"] = "Cancelled";
    OrchestrationStopReason["GoalAchieved"] = "GoalAchieved";
    OrchestrationStopReason["SensorRequestedStop"] = "SensorRequestedStop";
})(OrchestrationStopReason || (exports.OrchestrationStopReason = OrchestrationStopReason = {}));
/**
 * Default no-op sink. Use when you do not need any output or logging.
 */
class NullSink {
    constructor() {
    }
    onTickStart(_rt) {
    }
    onScored(_rt, _scored) {
    }
    onChosen(_rt, _chosen, _utility) {
    }
    onActed(_rt, _chosen) {
    }
    onStopped(_rt, _reason) {
    }
}
exports.NullSink = NullSink;
/** A single reusable instance. */
NullSink.instance = new NullSink();
/**
 * Fan-out sink that forwards all events to multiple sinks.
 */
class CompositeSink {
    /** Create a composite forwarding to the provided sinks in order. */
    constructor(...sinks) {
        this.sinks = sinks;
    }
    onTickStart(rt) {
        for (const s of this.sinks)
            s.onTickStart(rt);
    }
    onScored(rt, scored) {
        for (const s of this.sinks)
            s.onScored(rt, scored);
    }
    onChosen(rt, chosen, utility) {
        for (const s of this.sinks)
            s.onChosen(rt, chosen, utility);
    }
    onActed(rt, chosen) {
        for (const s of this.sinks)
            s.onActed(rt, chosen);
    }
    onStopped(rt, reason) {
        for (const s of this.sinks)
            s.onStopped(rt, reason);
    }
}
exports.CompositeSink = CompositeSink;
/**
 * Simple in-memory sink that records per-tick decisions for later inspection (tests, debugging, reports).
 */
class RecordingSink {
    constructor() {
        this._ticks = [];
        this._lastScored = Object.freeze([]);
    }
    /** Immutable list of recorded ticks in order. */
    get ticks() {
        return this._ticks;
    }
    /** @inheritdoc */
    onTickStart(_rt) {
        this._lastScored = Object.freeze([]);
    }
    /** @inheritdoc */
    onScored(_rt, scored) {
        // Copy to avoid future mutation issues
        this._lastScored = Object.freeze(scored.map(sp => (Object.assign({}, sp))));
    }
    /** @inheritdoc */
    onChosen(rt, chosen, utility) {
        this._ticks.push({
            tick: rt.tick, // assuming Runtime exposes a 'tick' number like the C# version
            scored: this._lastScored,
            chosen,
            chosenUtility: utility,
        });
    }
    /** @inheritdoc */
    onActed(_rt, _chosen) {
    }
    /** @inheritdoc */
    onStopped(_rt, _reason) {
    }
}
exports.RecordingSink = RecordingSink;
