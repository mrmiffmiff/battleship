export default class UIController {
    constructor(gameController) {
        this.game = gameController;
        this.leftGrid = document.querySelector("#board1 board");
        this.rightGrid = document.querySelector("#board2 board");
        this.status = document.querySelector("#status");
    }
}