const ROWS = 10, COLUMNS = 10;
export { ROWS, COLUMNS }
class Tile {
    constructor() {
        this.firedUpon = false;
        this.ship = null;
    }
}

export default class Gameboard {
    constructor() {
        this.matrix = new Array(ROWS).fill(null).map(() => new Array(COLUMNS).fill(null).map(() => new Tile()));
        this.fleet = [];
    }

    #validPlacement(shipLength, row, column, direction) {
        switch (direction) {
            case 'h':
                if (column + shipLength > COLUMNS)
                    throw new Error("Out of bounds horizontal placement");
                for (let i = column; i < column + shipLength; i++) {
                    if (this.matrix[row][i].ship) throw new Error("Collision");
                }
                break;
            case 'v':
                if (row + shipLength > ROWS)
                    throw new Error("Out of bounds vertical placement");
                for (let i = row; i < row + shipLength; i++) {
                    if (this.matrix[i][column].ship) throw new Error("Collision");
                }
                break;
        }
    }

    placeShip(ship, row, column, direction) {
        if (direction !== 'h' && direction !== 'v') throw new Error('Invalid direction'); // Shouldn't happen but...
        this.#validPlacement(ship.length, row, column, direction); // Any errors will of course be handled in the game controller
        switch (direction) {
            case 'h':
                for (let i = column; i < column + ship.length; i++) {
                    this.matrix[row][i].ship = ship;
                }
                break;
            case 'v':
                for (let i = row; i < row + ship.length; i++) {
                    this.matrix[i][column].ship = ship;
                }
                break;
        }
        if (!this.fleet.includes(ship)) this.fleet.push(ship);
    }

    receiveAttack(row, column) {
        if (row < 0 || column < 0 || row >= ROWS || column >= COLUMNS) throw new Error("Out of bounds");
        if (this.areCoordinatesFiredUpon(row, column)) throw new Error("Duplicate attack");
        let hit = false, sunk = false;
        this.matrix[row][column].firedUpon = true;
        if (this.matrix[row][column].ship) {
            this.matrix[row][column].ship.hit();
            hit = true;
            if (this.matrix[row][column].ship.isSunk()) sunk = true;
        }
        return { hit, sunk };
    }

    get fleetGone() {
        for (let ship of this.fleet) {
            if (!ship.isSunk()) return false;
        }
        return true;
    }

    areCoordinatesFiredUpon(row, column) {
        return this.matrix[row][column].firedUpon;
    }
}