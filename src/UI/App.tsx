import {createSignal, onMount } from 'solid-js';
import { useGame, useGameBroadcaster } from '../index';


export default function App () {
  const game = useGame();
  const broadcaster = useGameBroadcaster();
  const [infoText, setInfoText] = createSignal("");

  onMount(() => {
    let canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
    game.init(canvas);

    broadcaster.subscribeUnique("update-UI", (data:any) => {
      setInfoText(JSON.stringify(data));
    });
  });


  return (
    <div>
      <h3>ts sandbox</h3>
      <h4>{infoText()}</h4>
      <canvas id="game-canvas" width={600} height={600} style={"border: 1px solid black"}></canvas>
    </div>
  );
};
