import Player from "./player";
import Gameboard from "../gameboard/gameboard";
import Ship from "../ships/ship";

describe('Player class tests', () => {

    describe('Player class basics', () => {
        test('Computer status tracked', () => {
            let testPlayer = new Player(true);
            expect(testPlayer.isComputer).toBeTruthy();
        });
        test('Human status tracked', () => {
            let testPlayer = new Player(false);
            expect(testPlayer.isComputer).toBeFalsy();
        });
    });

    describe('getRandomAttack', () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });

        test('On choosing coordinates already fired upon, chooses again', () => {
            // We can mock an instance of gameboard that has a mocked implementation of areCoordinatesFiredUpon (since we're not testing that that method actually does what it says)
            const board = {
                areCoordinatesFiredUpon: jest
                    .fn()
                    .mockReturnValueOnce(true)
                    .mockReturnValueOnce(false),
            };

            // Also want to mock the Math.random returns, using spyOn
            // 0, 1, followed by 5, 4
            // Ultimate return should be 5, 4
            jest.spyOn(Math, 'random')
                .mockReturnValueOnce(0)
                .mockReturnValueOnce(0.1)
                .mockReturnValueOnce(0.5)
                .mockReturnValueOnce(0.4);

            let coords = new Player(true).getRandomAttack(board);
            expect(coords).toEqual([5, 4]);

            // For good measure we'll make sure the checker was called twice; that will make sure the do-while is working properly
            expect(board.areCoordinatesFiredUpon).toHaveBeenCalledTimes(2);
        });
    });

    describe('Intelligent computer attacks', () => {
        test('Queues neighboring squares after a hit', () => {
            const board = new Gameboard();
            const ship = new Ship('test', 2);
            board.placeShip(ship, 5, 5, 'h');
            const bot = new Player(true);

            bot.attack(board, 5, 5);

            expect(bot.attackQueue).toContainEqual([4, 5]);
            expect(bot.attackQueue).toContainEqual([6, 5]);
            expect(bot.attackQueue).toContainEqual([5, 4]);
            expect(bot.attackQueue).toContainEqual([5, 6]);
            expect(bot.hitGroups.length).toBe(1);
            expect(bot.hitGroups[0].orientation).toBeNull();
        });

        test('Determines orientation and pursues in that direction', () => {
            const board = new Gameboard();
            const ship = new Ship('test', 3);
            board.placeShip(ship, 5, 5, 'h');
            const bot = new Player(true);

            bot.attack(board, 5, 5);
            const [r1, c1] = bot.getAttackCoordinates(board);
            expect([r1, c1]).toEqual([5, 6]);
            bot.attack(board, r1, c1);

            expect(bot.hitGroups[0].orientation).toBe('h');
            const [r2, c2] = bot.getAttackCoordinates(board);
            expect([r2, c2]).toEqual([5, 7]);
            const result = bot.attack(board, r2, c2);
            expect(result.sunk).toBeTruthy();
            expect(bot.attackQueue.length).toBe(0);
        });

        test('Handles multiple ships separately and independently', () => {
            const board = new Gameboard();
            const shipA = new Ship("testA", 2);
            const shipB = new Ship("testB", 2);
            board.placeShip(shipA, 0, 0, 'h');
            board.placeShip(shipB, 2, 2, 'v');
            const bot = new Player(true);

            bot.attack(board, 0, 0);
            bot.attack(board, 2, 2);

            expect(bot.hitGroups.length).toBe(2);
            expect(bot.attackQueue.length).toBe(6);
            expect(bot.attackQueue).toContainEqual([0, 1]);
            expect(bot.attackQueue).toContainEqual([2, 3]);

            bot.attack(board, 0, 1);

            expect(bot.hitGroups.length).toBe(1);
            expect(bot.attackQueue.length).toBe(4);
            expect(bot.attackQueue).not.toContainEqual([0, 1]);
            expect(bot.attackQueue).not.toContainEqual([1, 0]);
        });
    });
});
