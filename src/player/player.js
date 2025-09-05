import Gameboard, { ROWS, COLUMNS } from "../gameboard/gameboard";

export default class Player {
    // There need to be two types, but that can be tracked as a boolean, really
    constructor(isComputer) {
        this.isComputer = isComputer; // This boolean being true will help us know when to call many of the methods in this class
        this.Gameboard = new Gameboard(); // each player needs a board; methods will take the opponent's board as an input where needed
        // Regarding the opponent's board, I thought about a method of sanitizing what is output, but for human players the UI will take care of that
        // For computer players, it doesn't matter, as the algorithm controls what the computer does anyway; they don't actually "see" anything

        /* Properties below are only used when this player is a computer. They track potential targets for follow-up shots when the computer scores a hit.
         * A queue is used so that newly discovered higher-priority targets can be added to the front while older, lower-priority targets remain at the back.
         */
        this.attackQueue = [];
        /* When multiple ships are hit before being sunk we need to keep track of the hits for each ship separately.
         * This logic is likely not perfect.
         * Each element of this array is an object with the following structure:
         * { hits: [[r, c], ...], orientation: null | 'h' | 'v' }
         */
        this.hitGroups = [];
    }

    /* Just a bit of my thought process now. Any methods in here are probably only ever going to be invoked for a computer player.
     * But I want this class to handle all logic related to the actions of a player that aren't UI-specific. I'll have an attack method
     * that will take in the opponent's board as a parameter to call an attack on that board in those coordinates. It will return the result
     * no matter what. But for computer players, it'll also do some handling to help with more refined attack logic. Later, at least.
     * For initial programming, all attacks are random. I'll have another method that will get a random unattacked coordinate to attack,
     * because I want to make sure the base game logic works before I get into any more complex AI. I'll shift around some of these comments,
     * potentially, as needed.
     **/

    // This method just handles the actual act of attacking. Will be called from a stack starting at the UI, probably, for human players,
    // and from the game controller for computer players. Other parts would handle preventing invalid attacks, though the code for that is still
    // present in the receiveAttack method just in case.
    // I don't see how unit tests on this would be helpful at this time; it's only calling something else then returning its results.
    attack(opponentBoard, row, column) {
        let attackResult = opponentBoard.receiveAttack(row, column);

        // Computer players must follow up
        if (this.isComputer && attackResult.hit) {
            this.#processHit(opponentBoard, row, column, attackResult.sunk);
        }
        return attackResult;
    }

    // Utility method to determine if coordinates are within a board
    #inBounds(row, column) {
        return row >= 0 && row < ROWS && column >= 0 && column < COLUMNS;
    }

    // Queue-related utility methods
    #queueIncludes(row, column) {
        return this.attackQueue.some(coord => coord[0] === row && coord[1] === column); // Can't do a direct includes because the subarrays are objects
    }

    #addTarget(row, column) {
        if (this.#inBounds(row, column) && !this.#queueIncludes(row, column))
            this.attackQueue.unshift([row, column]);
    }

    // Find existing hit group adjacent to provided coordinates
    #findGroup(row, column) {
        for (const group of this.hitGroups) {
            for (const [r, c] of group.hits) {
                if (Math.abs(r - row) + Math.abs(c - column) === 1) return group;
            }
        }
        return null;
    }

    #processHit(board, row, column, sunk) {
        let group = this.#findGroup(row, column);
        if (!group) {
            group = { hits: [], orientation: null };
            this.hitGroups.push(group);
        }
        group.hits.push([row, column]);

        if (sunk) {
            // Remove any queued targets that are related to this group
            this.attackQueue = this.attackQueue.filter(([r, c]) => {
                return !group.hits.some(([hr, hc]) => Math.abs(hr - r) + Math.abs(hc - c) === 1);
            });
            const index = this.hitGroups.indexOf(group);
            this.hitGroups.splice(index, 1);
            return;
        }

        if (!group.orientation && group.hits.length >= 2) {
            const [first, second] = group.hits;
            group.orientation = (first[0] === second[0]) ? 'h' : 'v';
        }

        if (group.orientation) {
            if (group.orientation === 'h') {
                const rowConst = group.hits[0][0];
                const cols = group.hits.map(h => h[1]);
                const min = Math.min(...cols) - 1;
                const max = Math.max(...cols) + 1;
                if (this.#inBounds(rowConst, min) && !board.areCoordinatesFiredUpon(rowConst, min))
                    this.#addTarget(rowConst, min);
                if (this.#inBounds(rowConst, max) && !board.areCoordinatesFiredUpon(rowConst, max))
                    this.#addTarget(rowConst, max);
            }
            else {
                const colConst = group.hits[0][1];
                const rows = group.hits.map(h => h[1]);
                const min = Math.min(...rows) - 1;
                const max = Math.max(...rows) + 1;
                if (this.#inBounds(min, colConst) && !board.areCoordinatesFiredUpon(min, colConst))
                    this.#addTarget(min, colConst);
                if (this.#inBounds(max, colConst) && !board.areCoordinatesFiredUpon(max, colConst))
                    this.#addTarget(max, colConst);
            }
        }
        else {
            const neighbors = [
                [row - 1, column],
                [row + 1, column],
                [row, column - 1],
                [row, column + 1]
            ];
            for (const [r, c] of neighbors) {
                if (this.#inBounds(r, c) && !board.areCoordinatesFiredUpon(r, c))
                    this.#addTarget(r, c);
            }
        }
    }

    // This will only be used by computer players to get coordinates to attack when nothing else is a priority.
    // This will be returned to the game controller then used in the call to the attack method above.
    getRandomAttack(opponentBoard) {
        let row, column;

        function getRandomInt(max) {
            return Math.floor(Math.random() * max);
        }

        do {
            row = getRandomInt(ROWS);
            column = getRandomInt(COLUMNS);
        } while (opponentBoard.areCoordinatesFiredUpon(row, column));

        return [row, column];
    }

    // Get coordinates for computer to attack. If any targets are queued, they will be prioritized over random targets.
    getAttackCoordinates(opponentBoard) {
        while (this.attackQueue.length) {
            const [r, c] = this.attackQueue.shift();
            if (!opponentBoard.areCoordinatesFiredUpon(r, c)) return [r, c];
        }
        return this.getRandomAttack(opponentBoard);
    }
}