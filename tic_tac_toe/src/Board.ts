export class Board {
    private board: string[][];

    constructor() {
        this.board = [['_', '_', '_'], ['_', '_', '_'], ['_', '_', '_']];
    }

    getBoard(): string[][] {
        return this.board;
    }

    setPosition(row: number, col: number, symbol: string): void {
        this.board[row][col] = symbol;
    }

    getPosition(row: number, col: number): string {
        return this.board[row][col];
    }

    printBoard(): void {
        console.log(this.board.map(row => row.join(' ')).join('\n'));
    }

    makeMove(move: string, symbol: string): void {
        const [row, col] = move.split(' ');
        this.setPosition(Number(row), Number(col), symbol);
    }

    isFull(): boolean {
        return this.board.every(row => row.every(cell => cell !== '_'));
    }
}