import Player from "./player";

describe('Player class tests', () => {
    test('Computer status tracked', () => {
        let testPlayer = new Player(true);
        expect(testPlayer.isComputer).toBeTruthy();
    });
    test('Human status tracked', () => {
        let testPlayer = new Player(false);
        expect(testPlayer.isComputer).toBeFalsy();
    });
});