import {UtilityAiOrchestrator} from "../src/Orchestration/UtilityAiOrchestrator";
import {UserIntent, IntentGoal} from "../src/Utils/UserIntent";
import {DynamicWorldSensor, WorldState} from "./sensors";
import {LifeCapability} from "./capability";
import {CompositeSink, RecordingSink} from "../src/Orchestration/OrchestrationSink";
import {ConsoleSink} from "./consoleSink";

async function main() {
  const world = new WorldState();
  const orchestrator = new UtilityAiOrchestrator()
    .AddSensor(new DynamicWorldSensor(world, 0.8))
    .AddModule(new LifeCapability(world));

  const intent = new UserIntent(new IntentGoal("SurviveAndThrive"));
  const ac = new AbortController();

  const sink = new CompositeSink(new ConsoleSink(), new RecordingSink());

  await orchestrator.runAsync(intent, 30, ac.signal, sink);

  console.log("\nFinal world:", world);
}

main().catch(e => {
  console.error(e);
});
