
import { Vec2 } from './utility/mathUtils';
import SnakeGame from './snakeGame';
import Program from './lang';
import Broadcaster from './utility/broadcaster';

const BATCH_SIZE = 100;

export default class Game {
  private initiated: boolean = false;
  private canvas: HTMLCanvasElement|null = null;
  private ctx: CanvasRenderingContext2D|null = null;
  private snakeGames: SnakeGame[] = [];
  private updateSteps: number = 1;
  public broadcaster: Broadcaster = new Broadcaster();

  private longestLife: number = 0;
  private bestInstructions: number[] = [];

  constructor() {
    Object.assign(window, {game:this});
  }


  public init(canvas: HTMLCanvasElement) {
    if (this.initiated) {
      window.alert("Game already initiated");
      return;
    }
    this.initiated = true;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    for(let i = 0; i < BATCH_SIZE; i++) {
      let sg = new SnakeGame();
      sg.reset();
      sg.program.randomizeInstructions();
      this.snakeGames.push(sg);
    }

    setInterval(() => {
      for(let i = 0; i < this.updateSteps; i++) this.update();

      if(this.ctx && this.canvas) {
        this.snakeGames[0].draw(this.ctx);
      }
    }, 25);
  }


  public update() {
    let numAlive = 0;
    let bestFitness = 0;

    for(let i = 0; i < this.snakeGames.length; i++) {
      let sg = this.snakeGames[i];
      // if(sg.isGameOver()) {
      //   sg.init();
      //   sg.setBrain(new Program());
      // }
      if(!sg.isGameOver()) {
        sg.update();
        numAlive++;

        if(sg.fitness > bestFitness) {
          bestFitness = sg.fitness;
        }
      }
    }

    if(numAlive === 0) {
      this.newGen();
    }

    this.updateUI({numAlive, bestFitness});
  }


  private newGen() {
    this.snakeGames.sort((a, b) => b.fitness - a.fitness);

    for(let i = 0; i<this.snakeGames.length; i++) {
      if(i < 20) {
        // don't change top 20
      }else if (i < 50) {
        this.snakeGames[i].copyBrain(this.snakeGames[(i-20)%20].program); // copy top 20 and mutate
        this.snakeGames[i].program.mutateInstructions();
      }else {
        this.snakeGames[i].program.randomizeInstructions(); // randomize the rest
      }
      this.snakeGames[i].reset();
    }
  }


  private updateUI(data: any) {
    this.broadcaster.publish("update-UI", data);
  }
}