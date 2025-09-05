import { ROWS, COLUMNS } from "../gameboard/gameboard";
import Ship from "../ships/ship";

// Default fleet configuration; necessary here for manual ship placement
const FLEET = [
    ["Carrier", 5],
    ["Battleship", 4],
    ["Destroyer", 3],
    ["Submarine", 3],
    ["Patrol Boat", 2]
]

export default class UIController {
    constructor(gameController) {
        this.game = gameController;
        this.leftGrid = document.querySelector("#board1 .board");
        this.rightGrid = document.querySelector("#board2 .board");
        this.leftFleet = document.querySelector("#board1 .fleet-status");
        this.rightFleet = document.querySelector("#board2 .fleet-status");
        this.status = document.querySelector("#status");
        this.handleCellClick = this.#handleCellClick.bind(this); // Sort of silly but necessary
        this.boardsContainer = document.querySelector(".boards")

        // Elements for placement modal
        this.placementModal = document.querySelector("#placement-modal");
        this.placementGrid = document.querySelector("#placement-grid");
        this.shipSelect = document.querySelector("#ship-select");
        this.orientationToggle = document.querySelector("#orientation-toggle");
        this.confirmPlacement = document.querySelector("#confirm-placement");

        // Track state for manual placement
        this.orientation = 'h';
        this.shipInstances = new Map();
        this.placements = new Map();
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

    async init() {
        this.#buildBoards();
        await this.game.start();
    }

    showPlacementModal(board) {
        return new Promise((resolve) => {

            // build the placement grid to look similar to the normal ones
            this.placementGrid.innerHTML = "";
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLUMNS; c++) {
                    const cell = document.createElement("div");
                    cell.classList.add("gridCell");
                    cell.dataset.row = r;
                    cell.dataset.col = c;
                    this.placementGrid.appendChild(cell);
                }
            }

            // populate ship select and create ship instances (resetting as needed)
            this.shipSelect.innerHTML = "";
            this.shipInstances.clear();
            this.placements.clear();
            FLEET.forEach(([name, length]) => {
                const option = document.createElement("option");
                option.value = name;
                option.textContent = name;
                this.shipSelect.appendChild(option);
                this.shipInstances.set(name, new Ship(name, length));
            });

            // reset orientation
            this.orientation = 'h';
            this.orientationToggle.textContent = "Horizontal";

            // Helper function to deal with toggling orientation; arrow function to keep the this
            // Will be set as event listener
            const toggleOrientation = () => {
                this.orientation = (this.orientation === 'h') ? 'v' : 'h';
                this.orientationToggle.textContent = (this.orientation === 'h') ? "Horizontal" : "Vertical";
            };

            // Handler for actually clicking in the grid to place the ships
            const handleGridClick = (clicked) => {
                const cell = clicked.target;
                // Needs to actually be a cell and not in between them
                if (!cell.classList.contains("gridCell")) return;
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);
                const shipName = this.shipSelect.value;
                const ship = this.shipInstances.get(shipName);
                const placement = this.placements.get(shipName);
                let changed = false;

                if (placement && placement.row === row && placement.col === col) {
                    board.removeShip(ship);
                    this.placements.delete(shipName);
                    changed = true;
                }
                else {
                    if (placement) {
                        board.removeShip(ship);
                        this.placements.delete(shipName);
                    }
                    try {
                        board.placeShip(ship, row, col, this.orientation);
                        this.placements.set(shipName, { row: row, col: col });
                        changed = true;
                    } catch {
                        // just ignore invalid placements
                    }
                }

                if (changed) {
                    this.#drawBoard(this.placementGrid, board, true);
                    this.confirmPlacement.disabled = this.placements.size !== FLEET.length;
                }
            };

            // On confirm, remove handlers and hide modal
            const confirmPlacements = () => {
                this.placementModal.classList.add("hidden");
                this.orientationToggle.removeEventListener("click", toggleOrientation);
                this.placementGrid.removeEventListener("click", handleGridClick);
                this.confirmPlacement.removeEventListener("click", confirmPlacements);
                resolve();
            };

            this.orientationToggle.addEventListener("click", toggleOrientation);
            this.placementGrid.addEventListener("click", handleGridClick);
            this.confirmPlacement.addEventListener("click", confirmPlacements);

            this.confirmPlacement.disabled = true;
            this.placementModal.classList.remove("hidden");
            this.#drawBoard(this.placementGrid, board, true);
        });
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

    // Only relevant for human vs. human
    showTurnSwitchPrompt(nextPlayerLabel) {
        return new Promise((resolve) => {
            // Hide boards while switching
            this.boardsContainer.classList.add("hidden");

            // Simple modal with a button to start the next turn
            const modal = document.createElement("div");
            modal.classList.add("modal");
            const content = document.createElement("div");
            content.classList.add("modal-content");
            const button = document.createElement("button");
            button.textContent = (nextPlayerLabel) ? `Next Player: ${nextPlayerLabel}` : "Next Player";
            content.appendChild(button);
            modal.appendChild(content);
            document.body.appendChild(modal);

            const advanceTurn = () => {
                button.removeEventListener("click", advanceTurn);
                modal.remove();
                this.boardsContainer.classList.remove("hidden");
                resolve();
            };

            button.addEventListener("click", advanceTurn);
        });
    }

    enableClicks(label = "Your turn") {
        this.status.textContent = label;
        this.rightGrid.addEventListener("click", this.handleCellClick);
        this.rightGrid.classList.remove("disabled");
    }

    disableClicks(label = "Passing turn") {
        this.status.textContent = label;
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

    showGameOver(winnerLabel) {
        this.disableClicks();
        if (this.game.mode === "hvc")
            this.status.textContent = (winnerLabel === "human") ? "You win!" : "Computer wins!";
        else
            this.status.textContent = `${winnerLabel} wins!`;
    }
}