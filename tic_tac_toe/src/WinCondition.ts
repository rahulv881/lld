import { Board } from "./Board";

export class WinCondition {
    static check(b: Board): boolean {
        const  board = b.getBoard();

        // * Check Rows
        if(board[0][0] === board[0][1] && board[0][1] === board[0][2] && board[0][0] !== '_') {
            return true;
        }
        if(board[1][0] === board[1][1] && board[1][1] === board[1][2] && board[1][0] !== '_') {
            return true;
        }
        if(board[2][0] === board[2][1] && board[2][1] === board[2][2] && board[2][0] !== '_') {
            return true;
        }

        // * Check Columns
        if(board[0][0] === board[1][0] && board[1][0] === board[2][0] && board[0][0] !== '_') {
            return true;
        }
        if(board[0][1] === board[1][1] && board[1][1] === board[2][1] && board[0][1] !== '_') {
            return true;
        }
        if(board[0][2] === board[1][2] && board[1][2] === board[2][2] && board[0][2] !== '_') {
            return true;
        }

        if(board[0][0] === board[1][1] && board[1][1] === board[2][2] && board[0][0] !== '_') {
            return true;
        }
        if(board[0][2] === board[1][1] && board[1][1] === board[2][0] && board[0][2] !== '_') {
            return true;
        }

        return false;
    }
}