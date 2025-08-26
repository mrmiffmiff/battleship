import Ship from "../ships/ship";
import Player from "../player/player";

export default class GameController {
    // While I'm keeping Game Control and UI control in separate classes and files, they are intrinsically connected to some extent
    // Both of them will need references to each other, unfortunately
    // For the UI, it can be constructed with it, but for this, it needs to be added after the fact
    ui;

    constructor() {
        this.playerOne = new Player(false);
        this.playerTwo = new Player(true);
        this.current = this.playerOne;
        this.turnCount = 0;
    }
}