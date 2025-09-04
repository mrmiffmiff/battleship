import Ship from "../ships/ship";
import Player from "../player/player";
import { ROWS, COLUMNS } from "../gameboard/gameboard";

export default class GameController {
    // While I'm keeping Game Control and UI control in separate classes and files, they are intrinsically connected to some extent
    // Both of them will need references to each other, unfortunately
    // For the UI, it can be constructed with it, but for this, it needs to be added after the fact
    ui;

    constructor() {
        this.playerOne = new Player(false);
        this.playerTwo = new Player(true);
        this.current = this.playerOne;
        this.turnCount = 0;
    }

    // For the time being, ships are placed in fixed positions; this will change after core functionality is confirmed
    // #placeFixedShips(board) {
    //     board.placeShip(new Ship("Carrier", 5), 0, 0, "h");
    //     board.placeShip(new Ship("Battleship", 4), 2, 0, "h");
    //     board.placeShip(new Ship("Destroyer", 3), 4, 0, "h");
    //     board.placeShip(new Ship("Submarine", 3), 6, 0, "h");
    //     board.placeShip(new Ship("Patrol Boat", 2), 8, 0, "h");
    // }

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

    start() {
        if (!this.ui) throw new Error("UI controller not set in Game Controller"); // This shouldn't happen but just in case...
        this.#placeRandomShips(this.playerOne.Gameboard);
        this.#placeRandomShips(this.playerTwo.Gameboard);
        this.ui.renderBoards(this.playerOne.Gameboard, this.playerTwo.Gameboard);
        this.ui.enableClicks();
    }

    processMove(row, col) {
        const opponent = (this.current === this.playerOne) ? this.playerTwo : this.playerOne;
        const result = this.current.attack(opponent.Gameboard, row, col);
        this.turnCount++;
        this.ui.renderBoards(this.playerOne.Gameboard, this.playerTwo.Gameboard);

        if (this.turnCount >= 17 && opponent.Gameboard.fleetGone) { // the turn count check lets us short circuit this a bit
            this.ui.showGameOver(this.current === this.playerOne);
            return;
        }

        if (result.hit) {
            if (this.current === this.playerTwo) this.#queueComputerTurn();
            else this.ui.enableClicks();
            return;
        }

        this.current = opponent;
        if (this.current === this.playerTwo) this.#queueComputerTurn();
        else this.ui.enableClicks();
    }

    #queueComputerTurn() {
        this.ui.disableClicks();
        setTimeout(() => {
            const [r, c] = this.playerTwo.getRandomAttack(this.playerOne.Gameboard);
            this.processMove(r, c);
        }, 3000);
    }
}