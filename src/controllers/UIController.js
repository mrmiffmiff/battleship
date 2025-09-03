import { ROWS, COLUMNS } from "../gameboard/gameboard";

export default class UIController {
    constructor(gameController) {
        this.game = gameController;
        this.leftGrid = document.querySelector("#board1 .board");
        this.rightGrid = document.querySelector("#board2 .board");
        this.leftFleet = document.querySelector("#board1 .fleet-status");
        this.rightFleet = document.querySelector("#board2 .fleet-status");
        this.status = document.querySelector("#status");
        this.handleCellClick = this.#handleCellClick.bind(this); // Sort of silly but necessary
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

    #renderFleet(board, container) {
        container.innerHTML = "";
        board.fleet
            .filter((ship) => !ship.isSunk())
            .forEach((ship) => {
                const shipItem = document.createElement("li");
                shipItem.textContent = `${ship.name}: ${ship.damage}/${ship.length}`;
                container.appendChild(shipItem);
            });
    }

    renderBoards(leftBoard, rightBoard) {
        // For now we're going to assume that the left grid belongs to a human and the right board belongs to a computer
        // But I'm going to need to change this for two player later probably
        this.#drawBoard(this.leftGrid, leftBoard, true);
        this.#drawBoard(this.rightGrid, rightBoard, false);
        this.#renderFleet(leftBoard, this.leftFleet);
        this.#renderFleet(rightBoard, this.rightFleet);
    }

    // For now still assuming human vs computer, this is going to need to change some later

    enableClicks() {
        this.status.textContent = "Your turn";
        this.rightGrid.addEventListener("click", this.handleCellClick);
        this.rightGrid.classList.remove("disabled");
    }

    disableClicks() {
        this.status.textContent = "Computer thinking...";
        this.rightGrid.removeEventListener("click", this.handleCellClick);
        this.rightGrid.classList.add("disabled");
    }

    #handleCellClick(clickEvent) {
        const cell = clickEvent.target;
        if (!cell.classList.contains("gridCell")) return; // gotta be sure what we clicked is actually a cell
        const r = cell.dataset.row;
        const c = cell.dataset.col;
        this.disableClicks();
        this.game.processMove(r, c);
    }

    showGameOver(playerWon) {
        this.disableClicks();
        this.status.textContent = (playerWon) ? "You win!" : "Computer wins!";
    }
}