import { StatusBar } from "expo-status-bar";
import { useState } from "react";

import { Collection } from "./src/components/Collection";
import { DoneScreen } from "./src/components/DoneScreen";
import { GuideCamera } from "./src/components/GuideCamera";
import { Home } from "./src/components/Home";
import { LevelUp, type Power } from "./src/components/LevelUp";
import { taskPacks, type TaskPack } from "./src/data/packs";

type Route =
  | { name: "home" }
  | { name: "guide"; pack: TaskPack; stepIndex: number; activePower?: string }
  | { name: "level-up"; pack: TaskPack; nextStepIndex: number }
  | { name: "done"; pack: TaskPack }
  | { name: "collection" };

export default function App() {
  const [route, setRoute] = useState<Route>({ name: "home" });
  const [coins, setCoins] = useState(120);
  const [gems, setGems] = useState(20);
  const [xp, setXp] = useState(0);
  const [unlockedPackIds, setUnlockedPackIds] = useState<string[]>([]);

  const startPack = (pack: TaskPack) => setRoute({ name: "guide", pack, stepIndex: 0 });

  const advanceGuide = () => {
    if (route.name !== "guide") return;
    const isFinalWave = route.stepIndex === route.pack.steps.length - 1;
    if (isFinalWave) {
      setCoins((current) => current + 25);
      setGems((current) => current + 5);
      setXp((current) => current + route.pack.xp);
      setUnlockedPackIds((current) => current.includes(route.pack.id) ? current : [...current, route.pack.id]);
      setRoute({ name: "done", pack: route.pack });
      return;
    }
    setRoute({ name: "level-up", pack: route.pack, nextStepIndex: route.stepIndex + 1 });
  };

  const choosePower = (power: Power) => {
    if (route.name !== "level-up") return;
    setRoute({ name: "guide", pack: route.pack, stepIndex: route.nextStepIndex, activePower: power.name });
  };

  return (
    <>
      <StatusBar style={route.name === "collection" || route.name === "done" ? "dark" : "light"} />
      {route.name === "home" ? (
        <Home coins={coins} gems={gems} onOpenCollection={() => setRoute({ name: "collection" })} onChoosePack={startPack} packs={taskPacks} unlockedPackIds={unlockedPackIds} xp={xp} />
      ) : null}
      {route.name === "guide" ? (
        <GuideCamera
          activePower={route.activePower}
          pack={route.pack}
          stepIndex={route.stepIndex}
          onAdvance={advanceGuide}
          onExit={() => setRoute({ name: "home" })}
        />
      ) : null}
      {route.name === "level-up" ? <LevelUp onPick={choosePower} totalWaves={route.pack.steps.length} wave={route.nextStepIndex} /> : null}
      {route.name === "done" ? (
        <DoneScreen coins={coins} gems={gems} onClaim={() => setRoute({ name: "home" })} onCollection={() => setRoute({ name: "collection" })} pack={route.pack} />
      ) : null}
      {route.name === "collection" ? <Collection onBack={() => setRoute({ name: "home" })} onChoosePack={startPack} packs={taskPacks} unlockedPackIds={unlockedPackIds} /> : null}
    </>
  );
}
