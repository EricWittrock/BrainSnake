const NUM_COMMANDS = 6;
const NUM_INSTRUCTIONS = 30;
const NUM_EXECUTIONS = 200;

export default class Program {
    public registers: number[];
    public instructions: number[];
    private activeRegister: number;
    private isLogging: boolean;

    constructor() {
        this.instructions = [];
        this.registers = new Array(8).fill(0);
        this.activeRegister = 0;
        this.isLogging = false;

        this.randomizeInstructions();
    }

    public resetMemory() {
        for(let i = 0; i<this.registers.length; i++) {
            this.registers[i] = 0;
        }
        this.activeRegister = 0;
    }

    public randomizeInstructions() {
        this.instructions = [];
        for (let i = 0; i < NUM_INSTRUCTIONS*2; i++) {
            this.instructions.push(Math.floor((Math.random()-0.5) * 20));
        }

        // this.instructions = [9, 9, 0, 5, -1, -1, -10, 9, 2, 9, -10, -2, 9, -3, 2, 3, -3, 1, 3, 9, 8, -9, 1, -6, 0, -10, 7, -8, 9, -7, -5, 8, -5, 7, -5, 9, 5, -10, 7, -9];
        // this.mutateInstructions();
    }

    public mutateInstructions() {
        for(let i = 0; i<this.instructions.length; i++) {
            if(Math.random() < 0.1) {
                this.instructions[i] = Math.floor((Math.random()-0.5) * 20);
            }
        }
    }

    public runInstructions() {

        let stepCount = 0;
        let i = 0;
        while(i < this.instructions.length && stepCount++ < NUM_EXECUTIONS) {
            if(i < 0) i = 0;
            let cmd = this.instructions[i];
            let arg = this.instructions[i+1];
            i += 2;

            if(cmd < 0) cmd = Math.abs(cmd-1);
            cmd = cmd % NUM_COMMANDS;

            switch (cmd) {
                case 0:
                    this.activeRegister = Math.abs(arg) % this.registers.length;
                    this.log("active_register = arg");
                    break;
                case 1:
                    this.registers[this.activeRegister] += arg;
                    this.log("r += arg");
                    break;
                case 2:
                    this.registers[this.activeRegister] = 0;
                    this.log("r = 0");
                    break;
                case 3:
                    this.registers[0] = this.registers[this.activeRegister];
                    this.log("r0 = r");
                    break;
                case 4:
                    this.registers[this.activeRegister] = this.registers[0];
                    this.log("r = r0");
                    break;
                case 5:
                    if(this.registers[this.activeRegister] == 0) {
                        i += arg * 2;
                        this.log("jump " + arg);
                    }else {
                        this.log("no jump");
                    }
                    break;
                default:
                    throw new Error("Invalid command: " + cmd);
            }
    
        }
    }

    private log (s: any) {
        if(this.isLogging) {
            console.log(s);
        }
    }
}

let p = new Program();