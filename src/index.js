import "modern-normalize/modern-normalize.css";
import "./styles.css";

import GameController from "./controllers/GameController";
import UIController from "./controllers/UIController";

document.addEventListener("DOMContentLoaded", () => {
    const game = new GameController();
    const ui = new UIController(game);
    game.ui = ui;
    ui.init();
    //this is for temporary interactions, will be taken away
    window.game = game;
    window.ui = ui;
});