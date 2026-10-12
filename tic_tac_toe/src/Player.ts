import type { Interface as ReadlineInterface } from "node:readline/promises";

export class Player {
    private name: string;
    private symbol: string;

    private constructor(name: string, symbol: string) {
        this.name = name;
        this.symbol = symbol;
    }

    static Builder = async (rl: ReadlineInterface) => {

        let name = '';
        let symbol = '';

        name = await rl.question('Enter your name: ');
        symbol = await rl.question('Enter your symbol: ');

        return new Player(name, symbol);
    }

    setName(name: string): Player {
        this.name = name;
        return this;
    }

    setSymbol(symbol: string): Player {
        this.symbol = symbol;
        return this;
    }

    getSymbol = (): string => {
        return this.symbol;
    }

    getName = (): string => {
        return this.name;
    }

    makeMove = async (rl: ReadlineInterface): Promise<string> => {
        const move = await rl.question('Enter your move: ');
        return move;
    }

}