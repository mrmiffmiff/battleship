import Gameboard from "../gameboard/gameboard";

export default class Player {
    // There need to be two types, but that can be tracked as a boolean, really
    constructor(isComputer) {
        this.isComputer = isComputer; // This boolean being true will help us know when to call many of the methods in this class
        this.Gameboard = new Gameboard(); // each player needs a board; methods will take the opponent's board as an input where needed
        // Regarding the opponent's board, I thought about a method of sanitizing what is output, but for human players the UI will take care of that
        // For computer players, it doesn't matter, as the algorithm controls what the computer does anyway; they don't actually "see" anything
    }
}