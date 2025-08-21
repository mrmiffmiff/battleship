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
                if (column + shipLength + 1 > COLUMNS) // adding 1 accounts for zero-indexing; could have just compared to 9 instead
                    return "Out of bounds horizontal placement";
                for (let i = column; i < column + shipLength; i++) {
                    if (this.matrix[row][i].ship) return "Collision";
                }
                break;
            case 'v':
                if (row + shipLength + 1 > ROWS)
                    return "Out of bounds vertical placement";
                for (let i = row; i < row + shipLength; i++) {
                    if (this.matrix[i][column].ship) return "Collision";
                }
                break;
        }
        return "Valid";
    }

    placeShip(ship, row, column, direction) {
        if (direction !== 'h' && direction !== 'v') throw new Error('Invalid direction'); // Shouldn't happen but...
        const valid = this.#validPlacement(ship.length, row, column, direction);
        if (valid !== 'Valid') throw new Error(valid); // We will of course handle this error in the game controller and/or DOM so it's not ugly
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
        this.fleet.push(ship);
    }

    receiveAttack(row, column) {
        if (row + 1 < 1 || column + 1 < 1 || row + 1 > ROWS || column + 1 > COLUMNS) throw new Error("Out of bounds");
        if (this.matrix[row][column].firedUpon) throw new Error("Duplicate attack");
        this.matrix[row][column].firedUpon = true;
        if (this.matrix[row][column].ship) this.matrix[row][column].ship.hit();
    }

    get fleetGone() {
        for (let ship of this.fleet) {
            if (!ship.isSunk()) return false;
        }
        return true;
    }
}