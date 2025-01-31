/* @refresh reload */
import { render } from 'solid-js/web';

import './index.css';
import App from './UI/App';
import Game from './gameLogic/game';

const root = document.getElementById('game-root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

const game = new Game();

render(() => <App/>, root!);

export function useGame() { return game; }
export function useGameBroadcaster() { return game.broadcaster; }