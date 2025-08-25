import Gameboard, { ROWS, COLUMNS } from "../gameboard/gameboard";

export default class Player {
    // There need to be two types, but that can be tracked as a boolean, really
    constructor(isComputer) {
        this.isComputer = isComputer; // This boolean being true will help us know when to call many of the methods in this class
        this.Gameboard = new Gameboard(); // each player needs a board; methods will take the opponent's board as an input where needed
        // Regarding the opponent's board, I thought about a method of sanitizing what is output, but for human players the UI will take care of that
        // For computer players, it doesn't matter, as the algorithm controls what the computer does anyway; they don't actually "see" anything
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
        return attackResult;
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
}