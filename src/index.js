import "modern-normalize/modern-normalize.css";
import "./styles.css";

import GameController from "./controllers/GameController";
import UIController from "./controllers/UIController";
import showStartModal from "./startModal";

async function startGame() {
    const mode = await showStartModal();
    const game = new GameController(mode);
    const ui = new UIController(game);
    game.ui = ui;
    //this is for temporary interactions, will be taken away
    window.game = game;
    window.ui = ui;

    //actually initiate
    ui.init();
}

document.addEventListener("DOMContentLoaded", () => {
    startGame();
});