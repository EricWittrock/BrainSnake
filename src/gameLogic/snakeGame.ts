import { Vec2 } from "./utility/mathUtils";
import Program from './lang';

const GRID_SIZE = 20;
const MAX_LIFETIME = 250;

export default class SnakeGame {
    private pos: Vec2 = new Vec2(0, 0);
    private vel: Vec2 = new Vec2(1, 0);
    private tail: Vec2[] = [];
    private tailLength: number = 0;
    private lifeTime: number = 0;
    private lastMealLifeTime: number = 0;
    private apple: Vec2 = new Vec2(0, 0);
    private gameOver:boolean = false;
    public program: Program = new Program();
    public fitness:number = 0;

    constructor() {
        this.reset();
    }

    public reset() {
        this.pos = new Vec2(10, 10);
        this.vel = new Vec2(1, 0);
        this.tailLength = 5;
        this.tail = [];
        this.apple = new Vec2(15, 15);
        this.gameOver = false;
        this.lifeTime = 0;
        this.lastMealLifeTime = 0;
        this.fitness = 0;

        this.program.resetMemory();
    }

    public copyBrain(program: Program) {
        this.program.instructions = program.instructions.slice();
    }

    public moveUp() {
        if(this.vel.y === 1) return;
        this.vel = new Vec2(0, -1);
    }

    public moveDown() {
        if(this.vel.y === -1) return;
        this.vel = new Vec2(0, 1);
    }

    public moveLeft() {
        if(this.vel.x === 1) return;
        this.vel = new Vec2(-1, 0);
    }

    public moveRight() {
        if(this.vel.x === -1) return;
        this.vel = new Vec2(1, 0);
    }

    public update() {
        if(this.lifeTime > MAX_LIFETIME) this.gameOver = true;
        if(this.gameOver) return;
        this.lifeTime++;
        this.fitness += 1 / (this.distToApple() + 1);

        this.think();

        this.tail.push(new Vec2(this.pos.x, this.pos.y));
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;

        if(this.tail.length > this.tailLength) {
            this.tail.shift();
        }

        // eat the apple
        if(this.pos.x === this.apple.x && this.pos.y === this.apple.y) {
            this.tailLength++;
            this.lastMealLifeTime = this.lifeTime;
            // this.fitness += 10000000 / Math.pow(this.lifeTime - this.lastMealLifeTime + 1, 2)*0.0001;
            this.fitness += 5000;
            this.apple = new Vec2(Math.floor(Math.random() * GRID_SIZE), Math.floor(Math.random() * GRID_SIZE));
        }
        

        if(this.pos.x < 0 || this.pos.x >= GRID_SIZE || this.pos.y < 0 || this.pos.y >=GRID_SIZE) {
            this.die();
            // this.program?.randomizeInstructions();
            // this.program?.reset();
            // this.init();
            // return;
          }

    }

    private die() {
        this.gameOver = true;
    }

    private think() {
        this.program.resetMemory();
        this.program.registers[1] = this.pos.x;
        this.program.registers[2] = this.pos.y;
        this.program.registers[3] = this.apple.x;
        this.program.registers[4] = this.apple.y;
        this.program.runInstructions();
    
        let maxI = -1;
        let max = -99999;
        for(let i = 0; i < 4; i++) {
          if(this.program.registers[i] > max) {
            max = this.program.registers[i];
            maxI = i;
          }
        }
    
        switch(maxI) {
          case 0:
            this.moveUp();
            break;
          case 1:
            this.moveDown();
            break;
          case 2:
            this.moveLeft();
            break;
          case 3:
            this.moveRight();
            break;
        }

    }

    public draw(ctx: CanvasRenderingContext2D) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        ctx.clearRect(0, 0, width, height);

        ctx.fillStyle = this.gameOver ? 'gray' : 'black';
        this.tail.forEach((pos) => {
            this.drawRect(ctx, pos);
        });

        ctx.fillStyle = 'grey';
        this.drawRect(ctx, this.pos);

        ctx.fillStyle = 'red';
        this.drawRect(ctx, this.apple);
    }

    private drawRect(ctx: CanvasRenderingContext2D, pos: Vec2) {
        const gridWidth = ctx.canvas.width / GRID_SIZE;
        ctx.fillRect(pos.x * gridWidth, pos.y * gridWidth, gridWidth, gridWidth);
    }

    private addKeyControls() {
        window.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                    this.moveUp();
                    break;
                case 'ArrowDown':
                    this.moveDown();
                    break;
                case 'ArrowLeft':
                    this.moveLeft();
                    break;
                case 'ArrowRight':
                    this.moveRight();
                    break;
            }
        });
    }

    private distToApple(): number {
        return Math.abs(this.pos.x - this.apple.x) + Math.abs(this.pos.y - this.apple.y);
    }

    public getPosition(): Vec2 {
        return this.pos;
    }

    public getLifeTime(): number {
        return this.lifeTime;
    }

    public isGameOver(): boolean {
        return this.gameOver;
    }
}