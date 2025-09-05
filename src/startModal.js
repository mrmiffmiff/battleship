export default function showStartModal() {
    return new Promise((resolve) => {
        const modal = document.querySelector("#start-modal");
        const buttons = modal.querySelectorAll("button");

        function handleModeChoice(clickedButton) {
            const mode = clickedButton.target.dataset.mode;
            modal.classList.add("hidden");
            buttons.forEach((button) => button.removeEventListener("click", handleModeChoice));
            resolve(mode);
        }

        buttons.forEach((button) => button.addEventListener("click", handleModeChoice));
        modal.classList.remove("hidden");
    })
}
