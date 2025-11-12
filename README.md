# Utility AI

A TypeScript implementation of a Utility AI system for intelligent decision-making and action selection.

## Overview

Utility AI is a decision-making framework that scores potential actions based on multiple considerations, allowing agents to make contextually-aware choices. This library provides a flexible orchestration system that evaluates proposals through sensors, eligibility checks, and utility calculations.

## Core Concepts

### Orchestrator
The `UtilityAiOrchestrator` manages the decision-making cycle:
- Runs sensors to gather environmental data
- Collects proposals from capability modules
- Scores proposals based on utility calculations
- Selects and executes the best action

### Proposals
A `Proposal` represents a potential action with:
- **Considerations**: Factors that influence the utility score (0-1 range)
- **Eligibilities**: Hard constraints that determine if an action can be taken
- **Prior**: Base tendency for the action (default: 1.0)
- **Temperature**: Sharpness of decision-making (>1 = stricter, <1 = flatter)
- **Act Function**: The async action to execute

Utility is calculated as a geometric mean of considerations, adjusted by temperature and multiplied by the prior.

### Capability Modules
Modules that generate proposals based on the current runtime context. Implement the `CapabilityModule` interface to create custom behavior.

### Sensors
Gather environmental data before each decision tick. Implement the `Sensor` interface to add custom sensing logic.

## Installation

```bash
npm install
```

## Building

```bash
npm run build
```

## Usage Example

```typescript
import { UtilityAiOrchestrator } from './src/Orchestration/UtilityAiOrchestrator';
import { UserIntent } from './src/Utils/UserIntent';

const orchestrator = new UtilityAiOrchestrator()
  .AddSensor(mySensor)
  .AddModule(myCapabilityModule);

const intent = new UserIntent();
const abortSignal = new AbortController().signal;

await orchestrator.runAsync(intent, 10, abortSignal);
```

## Architecture

```
src/
├── Actions/          - Action interfaces
├── Capabilities/     - Capability module definitions
├── Considerations/   - Proposal, Consideration, and Eligibility logic
├── Orchestration/    - Core orchestration system
│   ├── Stack/       - Execution stack utilities
│   └── ...
├── Sensors/          - Sensor interfaces
└── Utils/           - Runtime, EventBus, and UserIntent utilities
```

## Key Features

- **Flexible Decision-Making**: Score actions based on multiple weighted factors
- **Eligibility Gating**: Hard constraints to filter invalid actions
- **Temperature Control**: Adjust decision sharpness
- **Event Bus**: Built-in event system for coordination
- **Stop Conditions**: Configurable stopping (max ticks, zero utility, no proposals)
- **Selection Strategies**: Pluggable selection algorithms (default: max utility)

## License

Open
