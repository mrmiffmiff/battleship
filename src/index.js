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
    //actually initiate
    ui.init();
}

document.addEventListener("DOMContentLoaded", () => {
    startGame();
});