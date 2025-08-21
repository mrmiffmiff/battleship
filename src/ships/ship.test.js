import Ship from "./ship";

describe('Ship class tests', () => {
    test('Ship constructor', () => {
        let testShip = new Ship('testShipName', 3);
        expect(testShip.name).toMatch('testShipName');
        expect(testShip.length).toBe(3);
    });

    test('Damage', () => {
        let testShip = new Ship('testShipName', 3);
        expect(testShip.damage).toBe(0);
        testShip.hit();
        expect(testShip.damage).toBe(1);
    });

    test('Damage cannot exceed length', () => {
        let testShip = new Ship('testShipName', 3);
        testShip.hit();
        testShip.hit();
        testShip.hit();
        testShip.hit();
        expect(testShip.damage).toBe(testShip.length);
    });

    test('Ship considered sunk when damage equals length', () => {
        let testShip = new Ship('testShipName', 3);
        expect(testShip.isSunk()).toBeFalsy();
        testShip.hit();
        testShip.hit();
        expect(testShip.isSunk()).toBeFalsy();
        testShip.hit();
        expect(testShip.isSunk()).toBeTruthy();
        testShip.hit();
        expect(testShip.isSunk()).toBeTruthy();
    });
});