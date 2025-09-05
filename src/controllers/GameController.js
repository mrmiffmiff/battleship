import Ship from "../ships/ship";
import Player from "../player/player";
import { ROWS, COLUMNS } from "../gameboard/gameboard";

export default class GameController {
    // While I'm keeping Game Control and UI control in separate classes and files, they are intrinsically connected to some extent
    // Both of them will need references to each other, unfortunately
    // For the UI, it can be constructed with it, but for this, it needs to be added after the fact
    ui;

    constructor(mode = "hvc") {
        this.playerOne = new Player(false);
        this.playerTwo = new Player(mode === "hvc");
        this.current = this.playerOne;
        this.turnCount = 0;
        this.mode = mode;
    }

    #placeRandomShips(board) {
        const fleet = [
            ["Carrier", 5],
            ["Battleship", 4],
            ["Destroyer", 3],
            ["Submarine", 3],
            ["Patrol Boat", 2]
        ];
        for (const mem of fleet) {
            const ship = new Ship(mem[0], mem[1]);
            let placed = false;
            while (!placed) {
                const dir = (Math.random() < 0.5) ? "h" : "v";
                function getRandomInt(max) {
                    return Math.floor(Math.random() * max);
                }
                const r = getRandomInt(ROWS);
                const c = getRandomInt(COLUMNS);
                try {
                    board.placeShip(ship, r, c, dir);
                    placed = true;
                } catch {
                    // just try again
                }
            }
        }
    }

    async start() {
        if (!this.ui) throw new Error("UI controller not set in Game Controller"); // This shouldn't happen but just in case...
        //this.#placeRandomShips(this.playerOne.Gameboard);
        await this.ui.showPlacementModal(this.playerOne.Gameboard);
        if (this.mode === "hvc")
            this.#placeRandomShips(this.playerTwo.Gameboard);
        else
            await this.ui.showPlacementModal(this.playerTwo.Gameboard);
        const opponent = (this.current === this.playerOne) ? this.playerTwo : this.playerOne;
        this.ui.renderBoards(this.current.Gameboard, opponent.Gameboard);
        if (this.mode === "hvc") this.ui.enableClicks();
        else this.ui.enableClicks("Player 1's turn");
    }

    processMove(row, col) {
        const opponent = (this.current === this.playerOne) ? this.playerTwo : this.playerOne;
        const result = this.current.attack(opponent.Gameboard, row, col);
        this.turnCount++;

        if (this.turnCount >= 17 && opponent.Gameboard.fleetGone) { // the turn count check lets us short circuit this a bit
            if (this.mode === "hvh") this.ui.renderBoards(this.current.Gameboard, opponent.Gameboard);
            else this.ui.renderBoards(opponent.Gameboard, this.current.Gameboard);
            let winnerLabel;
            if (this.mode === "hvc")
                winnerLabel = (this.current === this.playerOne) ? "human" : "computer";
            else
                winnerLabel = (this.current === this.playerOne) ? "Player 1" : "Player 2";
            this.ui.showGameOver(winnerLabel);
            return;
        }

        if (!result.hit) this.current = opponent;

        const nextOpponent = (this.current === this.playerOne) ? this.playerTwo : this.playerOne;
        this.ui.renderBoards(this.current.Gameboard, nextOpponent.Gameboard);
        if (this.mode === "hvc" && this.current.isComputer) {
            this.ui.renderBoards(nextOpponent.Gameboard, this.current.Gameboard);
            this.#queueComputerTurn();
        }
        else if (this.mode === "hvh" && !result.hit) {
            this.ui.showTurnSwitchPrompt((this.current === this.playerOne) ? "Player 1" : "Player 2")
                .then(() => {
                    this.ui.renderBoards(this.current.Gameboard, nextOpponent.Gameboard);
                    const label = (this.current === this.playerOne) ? "Player 1's turn" : "Player 2's turn";
                    this.ui.enableClicks(label);
                });
        }
        else {
            this.ui.renderBoards(this.current.Gameboard, nextOpponent.Gameboard);
            if (this.mode === "hvc") this.ui.enableClicks();
            else {
                const label = (this.current === this.playerOne) ? "Player 1's turn" : "Player 2's turn";
                this.ui.enableClicks(label);
            }
        }
    }


    #queueComputerTurn() {
        this.ui.disableClicks("Computer thinking...");
        setTimeout(() => {
            const [r, c] = this.playerTwo.getRandomAttack(this.playerOne.Gameboard);
            this.processMove(r, c);
        }, 0);
    }

}