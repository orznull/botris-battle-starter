import 'dotenv/config'

import { BOTS } from "./bot";

import * as readline from 'readline';

// Create an interface for reading lines
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


// Function to get a string input
function prompt(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (input: string) => {
      resolve(input);
    });
  });
}

async function main() {
  let chosen = process.env.BOT_INDEX ?? "";
  while (!BOTS[Number.parseInt(chosen)]) {
    console.log(BOTS.map((({ name }, i) => `[${i}] ${name}`)).join("\n"));
    chosen = await prompt("> ");
  }
  const bot = BOTS[Number.parseInt(chosen)];
  console.log(`Playing as ${bot!.name}`);
  !process.env.BOT_INDEX && console.log("If you want to skip the selection process next time, set BOT_INDEX in your .env file.")

  if (!process.env.ROOM_KEY) {
    const input = await prompt("Room Key (NOT room id) > ");
    if (input) process.env.ROOM_KEY = input;
    console.log("If you want to skip this next time, set ROOM_KEY in your .env file.")
  }
  bot?.start();
  rl.close();
}

main();