export default class Ship {
    constructor(name, length) {
        this.name = name;
        this.length = length;
        this.damage = 0;
    }

    hit() {
        if (this.damage < this.length) this.damage++;
    }

    isSunk() {
        return this.damage === this.length;
    }
}
