import {IAction} from "../src/Actions/Action";
import {WorldState} from "./sensors";

export type NoReq = void;
export type NoRes = void;

export class EatAction implements IAction<NoReq, NoRes> {
  constructor(private world: WorldState) {}
  async actAsync(): Promise<void> {
    // Eating reduces hunger, costs a little money, increases energy slightly
    this.world.hunger = clamp01(this.world.hunger - 0.6);
    this.world.energy = clamp01(this.world.energy + 0.1);
    this.world.money = clamp01(this.world.money - 0.05);
    this.world.mealsEaten += 1;
    await sleep(50);
  }
}

export class WorkAction implements IAction<NoReq, NoRes> {
  constructor(private world: WorldState) {}
  async actAsync(): Promise<void> {
    // Working earns money but costs energy and increases hunger
    this.world.money = clamp01(this.world.money + 0.15);
    this.world.energy = clamp01(this.world.energy - 0.2);
    this.world.hunger = clamp01(this.world.hunger + 0.1);
    this.world.hoursWorked += 1;
    await sleep(50);
  }
}

export class SleepAction implements IAction<NoReq, NoRes> {
  constructor(private world: WorldState) {}
  async actAsync(): Promise<void> {
    // Sleeping restores energy a lot, slightly reduces hunger decay pressure
    this.world.energy = clamp01(this.world.energy + 0.6);
    this.world.hunger = clamp01(this.world.hunger + 0.02); // time passes, still hungrier
    await sleep(50);
  }
}

function clamp01(x: number): number { return Math.max(0, Math.min(1, x)); }
function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }
