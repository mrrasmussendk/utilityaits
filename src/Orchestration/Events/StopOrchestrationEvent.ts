import {OrchestrationStopReason} from "../OrchestrationSink";

export interface StopOrchestrationEvent {
    reason: OrchestrationStopReason,
    message?: string
}
export const STOP_ORCHESTRATION_EVENT = Symbol("StopOrchestrationEvent");
