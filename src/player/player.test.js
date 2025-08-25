import Player from "./player";

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
});