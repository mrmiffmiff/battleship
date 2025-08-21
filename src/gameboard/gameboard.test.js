import Gameboard from "./gameboard";
import Ship from "../ships/ship";

describe('Gameboard class tests', () => {
    describe('Gameboard generation tests', () => {
        let testBoard = new Gameboard();
        test('New gameboard has matrix with 10 rows', () => {
            expect(testBoard.matrix).toHaveLength(10);
        });

        test('Each row of new gameboard matrix should have 10 columns', () => {
            for (let row of testBoard.matrix) {
                expect(row).toHaveLength(10);
            }
        })

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
        test('Invalid direction', () => {
            let testBoard = new Gameboard();
            let testShip = new Ship('test', 5);
            expect(() => { testBoard.placeShip(testShip, 3, 4, 'wffeqwf') }).toThrow('Invalid direction');
        })

        test('Invalid horizontal placement', () => {
            let testBoard = new Gameboard();
            let testShip = new Ship('test', 5);
            expect(() => { testBoard.placeShip(testShip, 3, 5, 'h') }).toThrow('Out of bounds horizontal placement');
        });

        test('Valid horizontal placement', () => {
            let testBoard = new Gameboard();
            let testShip = new Ship('test', 5);
            expect(() => { testBoard.placeShip(testShip, 3, 4, 'h') }).not.toThrow();
            for (let i = 4; i < 4 + testShip.length; i++) {
                expect(testBoard.matrix[3][i]).toHaveProperty('ship', testShip);
            }
        });

        test('Invalid vertical placement', () => {
            let testBoard = new Gameboard();
            let testShip = new Ship('test', 5);
            expect(() => { testBoard.placeShip(testShip, 5, 3, 'v') }).toThrow('Out of bounds vertical placement');
        });

        test('Valid vertical placement', () => {
            let testBoard = new Gameboard();
            let testShip = new Ship('test', 5);
            expect(() => { testBoard.placeShip(testShip, 4, 3, 'v') }).not.toThrow();
            for (let i = 4; i < 4 + testShip.length; i++) {
                expect(testBoard.matrix[i][3]).toHaveProperty('ship', testShip);
            }
        });

        test('Collisions', () => {
            let testBoard = new Gameboard();
            let testShipOne = new Ship('test', 5);
            let testShipTwo = new Ship('testTwo', 3);
            testBoard.placeShip(testShipOne, 4, 3, 'v');
            expect(() => { testBoard.placeShip(testShipTwo, 7, 2, 'h') }).toThrow('Collision');
            expect(() => { testBoard.placeShip(testShipTwo, 3, 3, 'v') }).toThrow('Collision');
            expect(() => { testBoard.placeShip(testShipTwo, 3, 3, 'h') }).not.toThrow('Collision');
        });
    });

    describe('Attack reception', () => {
        let testBoard;

        beforeEach(() => {
            testBoard = new Gameboard();
            let testShipOne = new Ship('test', 5);
            let testShipTwo = new Ship('testTwo', 3);
            testBoard.placeShip(testShipOne, 4, 3, 'v');
            testBoard.placeShip(testShipTwo, 3, 3, 'h');
        })

        // There's probably no need to test for attacks outside proper coordinates as eventually selection will be handled by the GUI
        // But for now I'm going to include it
        test('Invalid coordinates', () => {
            expect(() => { testBoard.receiveAttack(3, 13) }).toThrow("Out of bounds");
        });

        test('Empty spot', () => {
            testBoard.receiveAttack(5, 5);
            expect(testBoard.matrix[5][5]).toHaveProperty('firedUpon', true);
        });

        test('Ship hit', () => {
            testBoard.receiveAttack(4, 3);
            expect(testBoard.matrix[4][3].ship).toHaveProperty('damage', 1);
        });

        test('Cannot fire on same spot more than once', () => {
            testBoard.receiveAttack(5, 5);
            expect(() => { testBoard.receiveAttack(5, 5) }).toThrow("Duplicate attack");
        });

        // There's no need to test that an individual ship sinks as that's already tested, but we do need to implement fleets
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