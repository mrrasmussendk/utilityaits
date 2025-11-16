import {Sensor} from "../src/Sensors/Sensor";
import {Runtime} from "../src/Utils/Runtime";
import {OrchestrationStopReason} from "../src/Orchestration/OrchestrationSink";
import {STOP_ORCHESTRATION_EVENT} from "../src/Orchestration/Events/StopOrchestrationEvent";

export class WorldState {
  // All values are clamped to [0,1]
  hunger: number = 0.3;   // 0 = full, 1 = starving
  energy: number = 0.7;   // 0 = exhausted, 1 = fully rested
  money: number = 0.2;    // 0..1 scaled wealth
  timeOfDay: number = 0.3; // 0..1, 0 = midnight, 0.5 = noon
  mealsEaten: number = 0;
  hoursWorked: number = 0;
}

export class DynamicWorldSensor implements Sensor {
  private readonly world: WorldState;
  private readonly goalMoney: number;

  constructor(world: WorldState, goalMoney = 0.8) {
    this.world = world;
    this.goalMoney = goalMoney;
  }

  async senseAsync(rt: Runtime): Promise<void> {
    // Publish the current world each tick, then update it to simulate environment progression
    rt.bus.publish(WorldState, this.world);

    // If goal achieved, request stop
    if (this.world.money >= this.goalMoney) {
      rt.bus.publish(STOP_ORCHESTRATION_EVENT, { reason: OrchestrationStopReason.GoalAchieved });
      return;
    }

    // Simple day progression and natural drifts
    this.world.timeOfDay = clamp01(this.world.timeOfDay + 0.07); // ~14 ticks per day
    this.world.hunger = clamp01(this.world.hunger + 0.08);       // gets hungrier
    this.world.energy = clamp01(this.world.energy - 0.05);       // gets tired

    // At end of day, wrap and decay money slightly to encourage ongoing work
    if (this.world.timeOfDay >= 1) {
      this.world.timeOfDay = 0;
      this.world.money = clamp01(this.world.money * 0.98);
    }
  }
}

function clamp01(x: number): number { return Math.max(0, Math.min(1, x)); }
