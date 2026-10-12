import { stdin, stdout } from "process";
import { Board } from "./Board";
import { Player } from "./Player";
import * as readline from "readline/promises";
import { WinCondition } from "./WinCondition";

export class Game {
    private board: Board = new Board();
    private player1: Player | null = null;
    private player2: Player | null = null;

    private constructor() {
        this.board = new Board();
    }

    static Builder: () => Promise<Game> = async () => {
        return new Game();
    }
    setPlayer1 = async(player: Player) => {
        this.player1 = player;
    }
    setPlayer2 = async(player: Player) => {
        this.player2 = player;
    }
    async start(rl: readline.Interface): Promise<void> {
        if(!this.player1 || !this.player2) {
            throw new Error('Player 1 and Player 2 are required');
        }
        this.board.printBoard();
        let toggle = true;
        while(!WinCondition.check(this.board) || this.board.isFull()) {
            const player = toggle ? this.player1 : this.player2;
            const move = await player.makeMove(rl);
            this.board.makeMove(move, player.getSymbol());
            this.board.printBoard();
            toggle = !toggle;
        }

        if(WinCondition.check(this.board)) {
            console.log(`${!toggle ? this.player1.getName() : this.player2.getName()} wins!`);
        } else {
            console.log('Draw!');
        }
    }
}