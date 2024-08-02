# tetris starter bot

  

a little typescript starter for [botris battle](https://botrisbattle.com/). 

intended for beginners to any kind of AI coding.

forked from https://github.com/newclarityex/libtris

  

## Quick Start

1. Register on  [botris battle](https://botrisbattle.com/)
2. Create a token on the dashboard
3. Create a file named `.env` (a template `.env.template` is provided)
4. Input your token in the `TOKEN` field 
5. Open a room on botris battle, and copy either a single use key or the master key.
6. Run the following commands:
```
npm i # install dependencies
npm run dev # try out the bot!
```
NOTE: the `dev` script uses `tsx`, which runs typescript on the fly for your convenience, but isn't meant for production. Run `build-and-start` to actually compile to JS and get full performance.

Bot files are under `src/bot`. Export a `name` and `start` function, and add it to `src/bot/index.ts` for things to work.

## What's Provided
- `src/engine/...` - This is engine code forked directly from the docs ([libtris](https://github.com/newclarityex/libtris)), ostensibly this is what the site is actually using to run with. Has all the SRS, attack table, etc. in it already, plus helpful utility functions to move pieces and calculate some statistics about the board.
- `src/ws/...` - Helper functions to a socket connected to the site +  some of the network types that the documentation provided.
- `src/bot`
	- `/utils` - A couple of helper functions I wrote to get my simple bot up and running. Most notable is probably `getPossibleMoves` which will return all possible moves + resultant game states + clear events for a provided gamestate. (It was written pretty hastily and simply, there's a ton of room for optimization here!)
	- `/seppuku.ts` - an extremely simple bot example that just kills itself as fast as possible.
	-  `/eternal.ts` - a simple bot example that uses basic tetris principles (heuristics) to guide its play. It plays queueless out of the box, but some sample code for searching multiple pieces is provided.  **I recommend starting here!** Copy this file and and poke around with the heuristics.

## What to do next

Again, this is mostly meant to be a starter and there are ton of ways to improve the bot! Some ideas:
- **Optimize the engine functions + heuristic evaluations.** Pretty common way for these types of board game AI stuff is using [bitboards](https://en.wikipedia.org/wiki/Bitboard) + bitwise functions instead of using higher level abstractions.
-  **Game Tree Search Algorithms** I left some very basic code to search down a layer or two in my sample bot, but it's extreeeemely unoptimized and pretty dumb. Some good initial directions are [MCTS](https://en.wikipedia.org/wiki/Monte_Carlo_tree_search) and [alpha beta pruning](https://en.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning).
- **Improve heuristics** My bot currently only uses the board itself to evaluate moves. It doesn't take into account attack or anything at all. Maybe you have better ideas for interesting heuristics! See something like mystery's [blockfish heuristic](https://github.com/blockfish/blockfish/blob/e568e9f09fa19647929ec89f3838ec6710cdff23/blockfish-engine/src/ai/eval.rs#L42) for something creative. Remember though, robots are robots! Evaluating against our human tetris principles is not necessarily optimal!
- **Tune your heuristic weights** I picked weights for each of my heuristics completely by intuition. Pit your bot against itself with different weights, see what's optimal. Maybe even create tooling to automate this process and approach optimal values.
- **Rewrite this in not typescript lol**
