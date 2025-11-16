// Public API barrel for npm consumers

// Orchestration
export { UtilityAiOrchestrator } from './Orchestration/UtilityAiOrchestrator';
export { Orchestrator } from './Orchestration/Orchestrator';
export {
  OrchestrationSink,
  OrchestrationStopReason,
  NullSink,
  CompositeSink,
  RecordingSink,
  type OrchestrationTick,
  type ScoredProposal
} from './Orchestration/OrchestrationSink';
export { MaxUtilitySelection, type SelectionStrategy } from './Orchestration/SelectionStrategy';

// Considerations & Proposals
export { Proposal, type ActFn } from './Considerations/Proposal';
export { type Consideration } from './Considerations/Consideration';
export { type Eligibility } from './Considerations/Eligibility';

// Sensors & Capabilities
export { type Sensor } from './Sensors/Sensor';
export { type CapabilityModule } from './Capabilities/CapabilityModule';

// Utils
export { EventBus, createEventKey, type Type } from './Utils/EventBus';
export { UserIntent, IntentGoal, type Slots } from './Utils/UserIntent';
export { type Runtime } from './Utils/Runtime';

// Events
export { STOP_ORCHESTRATION_EVENT, type StopOrchestrationEvent } from './Orchestration/Events/StopOrchestrationEvent';
