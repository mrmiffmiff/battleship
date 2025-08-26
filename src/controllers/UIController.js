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
    }
}