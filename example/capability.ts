import {CapabilityModule} from "../src/Capabilities/CapabilityModule";
import {Runtime} from "../src/Utils/Runtime";
import {Proposal} from "../src/Considerations/Proposal";
import {Consideration} from "../src/Considerations/Consideration";
import {Eligibility} from "../src/Considerations/Eligibility";
import {WorldState} from "./sensors";
import {EatAction, SleepAction, WorkAction} from "./actions";
import {expPow, inverse, sigmoid} from "./curves";

class WorldAvailable implements Eligibility {
  isEligible(rt: Runtime): boolean {
    return !!rt.bus.getOrDefault(WorldState);
  }
}

class FromWorld implements Consideration {
  private readonly f: (w: WorldState) => number;
  constructor(f: (w: WorldState) => number) { this.f = f; }
  evaluate(rt: Runtime): number {
    const w = rt.bus.getOrDefault(WorldState);
    if (!w) return 0;
    return Math.max(0, Math.min(1, this.f(w)));
  }
}

export class LifeCapability implements CapabilityModule {
  private readonly world: WorldState;
  private readonly elig = [new WorldAvailable()];

  constructor(world: WorldState) {
    this.world = world;
  }

  propose(rt: Runtime): Proposal[] {
    const w = this.world; // mutate via actions

    // Considerations use shaped curves to express priorities:
    // Eat: urgent when hunger is high, also consider energy low makes eating slightly less effective
    const eatCons: Consideration[] = [
      new FromWorld(ws => expPow(ws.hunger, 2.2)), // very hungry -> high
      new FromWorld(ws => sigmoid(inverse(ws.energy), 6, 0.4)), // low energy nudges toward eat vs work
    ];
    const eat = new Proposal(
      "Eat",
      eatCons,
      async (ct) => {
        if (ct.aborted) return;
        await new EatAction(w).actAsync();
      },
      this.elig
    );
    eat.prior = 0.9;
    eat.temperature = 1.0;

    // Work: high when money is low and energy is decent
    const workCons: Consideration[] = [
      new FromWorld(ws => expPow(inverse(ws.money), 1.8)),
      new FromWorld(ws => expPow(ws.energy, 1.2)),
    ];
    const work = new Proposal(
      "Work",
      workCons,
      async (ct) => {
        if (ct.aborted) return;
        await new WorkAction(w).actAsync();
      },
      this.elig
    );
    work.prior = 0.8;
    work.temperature = 1.2; // be a bit strict

    // Sleep: high when energy is low; also mildly affected by time of day (more at night)
    const sleepCons: Consideration[] = [
      new FromWorld(ws => expPow(inverse(ws.energy), 2.0)),
      new FromWorld(ws => sigmoid(ws.timeOfDay < 0.5 ? (1 - ws.timeOfDay * 2) : 0, 10, 0.3)), // higher near night
    ];
    const sleep = new Proposal(
      "Sleep",
      sleepCons,
      async (ct) => {
        if (ct.aborted) return;
        await new SleepAction(w).actAsync();
      },
      this.elig
    );
    sleep.prior = 0.7;
    sleep.temperature = 1.1;

    return [eat, work, sleep];
  }
}
