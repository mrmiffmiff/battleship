import { ROWS, COLUMNS } from "../gameboard/gameboard";

export default class UIController {
    constructor(gameController) {
        this.game = gameController;
        this.leftGrid = document.querySelector("#board1 .board");
        this.rightGrid = document.querySelector("#board2 .board");
        this.status = document.querySelector("#status");
    }

    // Build out the basic double board layout
    #buildBoards() {
        [this.leftGrid, this.rightGrid].forEach((grid) => {
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLUMNS; c++) {
                    const cell = document.createElement("div");
                    cell.classList.add("gridCell");
                    cell.dataset.row = r;
                    cell.dataset.col = c;
                    grid.appendChild(cell);
                }
            }
        });
    }

    init() {
        this.#buildBoards();
        this.game.start();
    }

    /* Grid is the UI element; board is the internal structure; showShips controls whether unhit ships should be visible. */
    #drawBoard(grid, board, showShips) {
        grid.querySelectorAll(".gridCell").forEach((cell) => {
            const r = cell.dataset.row;
            const c = cell.dataset.col;
            const tile = board.matrix[r][c];

            cell.className = "gridCell"; // each time we redraw we just want to clear things back to default at first

            if (showShips && tile.ship) cell.classList.add("gridShip");
            if (tile.firedUpon) cell.classList.add(tile.ship ? "gridHit" : "gridMiss");
        });
    }

    renderBoards(leftBoard, rightBoard) {
        // For now we're going to assume that the left grid belongs to a human and the right board belongs to a computer
        // But I'm going to need to change this for two player later probably
        this.#drawBoard(this.leftGrid, leftBoard, true);
        this.#drawBoard(this.rightGrid, rightBoard, false);
    }
}