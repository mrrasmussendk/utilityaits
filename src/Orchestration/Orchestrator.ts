import {UserIntent} from "../Utils/UserIntent";
import {OrchestrationSink} from "./OrchestrationSink";

export interface Orchestrator {

    runAsync(intent: UserIntent, maxTricks: number, as: AbortSignal, orchestrationSink: OrchestrationSink): Promise<void>;

}