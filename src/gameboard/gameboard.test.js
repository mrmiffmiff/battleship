import Gameboard, { ROWS, COLUMNS } from "./gameboard";
import Ship from "../ships/ship";

describe('Gameboard class tests', () => {
    describe('Gameboard generation tests', () => {
        let testBoard = new Gameboard();
        test('New gameboard has matrix with 10 rows', () => {
            expect(testBoard.matrix).toHaveLength(ROWS);
        });

        test('Each row of new gameboard matrix should have 10 columns', () => {
            for (let row of testBoard.matrix) {
                expect(row).toHaveLength(COLUMNS);
            }
        });

        test('New gameboard should have existent but empty tiles', () => {
            for (const row of testBoard.matrix) {
                for (const cell of row) {
                    expect(cell).toHaveProperty('firedUpon', false);
                    expect(cell).toHaveProperty('ship', null);
                }
            }
        });
    });

    describe('Ship placement', () => {
        let testBoard;

        beforeEach(() => {
            testBoard = new Gameboard();
        });

        test('Invalid direction', () => {
            let testShip = new Ship('test', 5);
            expect(() => { testBoard.placeShip(testShip, 3, 4, 'wffeqwf') }).toThrow('Invalid direction');
        });

        test('Invalid horizontal placement', () => {
            let testShip = new Ship('test', 5);
            expect(() => { testBoard.placeShip(testShip, 3, 6, 'h') }).toThrow('Out of bounds horizontal placement');
        });

        test('Valid horizontal placement', () => {
            let testShip = new Ship('test', 5);
            expect(() => { testBoard.placeShip(testShip, 3, 4, 'h') }).not.toThrow();
            for (let i = 4; i < 4 + testShip.length; i++) {
                expect(testBoard.matrix[3][i]).toHaveProperty('ship', testShip);
            }
        });

        test('Invalid vertical placement', () => {
            let testShip = new Ship('test', 5);
            expect(() => { testBoard.placeShip(testShip, 6, 3, 'v') }).toThrow('Out of bounds vertical placement');
        });

        test('Valid vertical placement', () => {
            let testShip = new Ship('test', 5);
            expect(() => { testBoard.placeShip(testShip, 4, 3, 'v') }).not.toThrow();
            for (let i = 4; i < 4 + testShip.length; i++) {
                expect(testBoard.matrix[i][3]).toHaveProperty('ship', testShip);
            }
        });

        test('Collisions', () => {
            let testShipOne = new Ship('test', 5);
            let testShipTwo = new Ship('testTwo', 3);
            testBoard.placeShip(testShipOne, 4, 3, 'v');
            expect(() => { testBoard.placeShip(testShipTwo, 7, 2, 'h') }).toThrow('Collision');
            expect(() => { testBoard.placeShip(testShipTwo, 3, 3, 'v') }).toThrow('Collision');
            expect(() => { testBoard.placeShip(testShipTwo, 3, 3, 'h') }).not.toThrow('Collision');
        });
    });

    describe('Ship removal', () => {
        let testBoard;
        let testShip;

        beforeEach(() => {
            testBoard = new Gameboard();
            testShip = new Ship('test', 3);
            testBoard.placeShip(testShip, 2, 2, 'h');
        });

        test('Removed ship clears tiles', () => {
            testBoard.removeShip(testShip);
            for (let i = 2; i < 2 + testShip.length; i++) {
                expect(testBoard.matrix[2][i]).toHaveProperty('ship', null);
            }
        });

        test('Removed ship clears from fleet', () => {
            expect(testBoard.fleet).toContain(testShip);
            testBoard.removeShip(testShip);
            expect(testBoard.fleet).not.toContain(testShip);
        })
    });

    describe('Attack reception', () => {
        let testBoard;

        beforeEach(() => {
            testBoard = new Gameboard();
            let testShipOne = new Ship('test', 5);
            let testShipTwo = new Ship('testTwo', 3);
            testBoard.placeShip(testShipOne, 4, 3, 'v');
            testBoard.placeShip(testShipTwo, 3, 3, 'h');
        });

        // There's probably no need to test for attacks outside proper coordinates as eventually selection will be handled by the GUI
        // But for now I'm going to include it
        test('Invalid coordinates', () => {
            expect(() => { testBoard.receiveAttack(3, 13) }).toThrow("Out of bounds");
        });

        test('Empty spot', () => {
            let attack = testBoard.receiveAttack(5, 5);
            expect(testBoard.matrix[5][5]).toHaveProperty('firedUpon', true);
            expect(attack).toHaveProperty('hit', false);
        });

        test('Ship hit', () => {
            let attack = testBoard.receiveAttack(4, 3);
            expect(testBoard.matrix[4][3].ship).toHaveProperty('damage', 1);
            expect(attack).toHaveProperty('hit', true);
        });

        test('Cannot fire on same spot more than once', () => {
            testBoard.receiveAttack(5, 5);
            expect(testBoard.areCoordinatesFiredUpon(5, 5)).toBeTruthy();
            expect(() => { testBoard.receiveAttack(5, 5) }).toThrow("Duplicate attack");
        });

        // While there's not actually a need to test sinking functionality in itself, since the returned object does indicate it, gotta test that
        test('Hit marked as sinking hit', () => {
            testBoard.receiveAttack(3, 3);
            testBoard.receiveAttack(3, 4);
            let finalAttack = testBoard.receiveAttack(3, 5);
            expect(finalAttack).toHaveProperty('sunk', true);
        });

        test('When ships still intact, fleet not destroyed', () => {
            expect(testBoard.fleetGone).toBeFalsy();
        });

        test('One ship destroyed but fleet should not be gone', () => {
            for (let i = 4; i < 4 + 5; i++) {
                testBoard.receiveAttack(i, 3);
            }
            expect(testBoard.fleetGone).toBeFalsy();
        });

        test('Fleet destroyed', () => {
            for (let i = 4; i < 4 + 5; i++) {
                testBoard.receiveAttack(i, 3);
            }
            for (let i = 3; i < 3 + 3; i++) {
                testBoard.receiveAttack(3, i);
            }
            expect(testBoard.fleetGone).toBeTruthy();
        });
    });
});