import { store, onStoreUpdate } from "../store";

export function mountHighscoreOverlay(container: HTMLElement): void {
  const render = () => {
    const top = store.highscore?.top ?? [];
    container.innerHTML = `
      <div class="highscore-title">HIGHSCORE</div>
      <ol>
        ${top
          .map(
            (entry) => `
          <li>
            <span class="swatch" style="background:${entry.color}"></span>
            #${entry.number} <span class="score">${entry.score}</span>
          </li>`,
          )
          .join("")}
      </ol>
    `;
  };
  onStoreUpdate(render);
  render();
}
