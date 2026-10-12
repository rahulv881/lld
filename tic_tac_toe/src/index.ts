import * as readline from 'node:readline/promises';
import type { Interface as ReadlineInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { Player } from './Player';
import { Game } from './Game';

async function promptInt(rl: ReadlineInterface, question: string, fallback: number): Promise<number> {
  const answer = (await rl.question(question)).trim();
  if (answer === '') return fallback;
  const n = Number(answer);
  return Number.isNaN(n) ? fallback : n;
}


async function main(): Promise<void> {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  try {
    console.log('=== Tic Tac Toe ===\n');

    const game = await Game.Builder();
    const player1 = await Player.Builder(rl);
    await game.setPlayer1(player1);
    const player2 = await Player.Builder(rl);
    await game.setPlayer2(player2);

    await game.start(rl);
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exitCode = 1;
});
