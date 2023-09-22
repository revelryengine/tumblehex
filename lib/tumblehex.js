import { html, css, LitElement } from 'lit';

import { Game      } from 'revelryengine/ecs/lib/game.js';
import { MainStage } from './stages/main.js';

class TumbleHexGame extends Game {
    constructor() {
        super();
        this.stages.add(new MainStage());
    }
}

export class TumbleHexElement extends LitElement {
    
    static get styles() {
        return css`
            :host {
                width: 100%;
                height: 100%;
                display: block;
                color: white;
                font-family: "Segoe WPC", "Segoe UI", sans-serif;
            }

            canvas {
                position: absolute;
                width: 100%;
                height: 100%;
            }

            .status-bar {
                position: absolute;
                user-select: none;
                pointer-events: none;
                top: 5px;
                left: 5px;
                margin: 0;
            }

            .gameover {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                padding: 15px;
                border-radius: 5px;
                font-size: xx-large;
                background: rgba(0, 0, 0, 0.5);
                cursor: pointer;
                user-select: none;
            }
        `;
    }

    static get properties() {
        return {
            game: { type: Object },
            over: { type: Boolean, reflect: true },
            win:  { type: Boolean, reflect: true },
        }
    }

    constructor() {
        super();
        this.status = document.createElement('pre');
        this.status.classList.add('status-bar')

        this.startGame();

        const loop = () => {
            this.updateStatusBar();
            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
    }

    startGame() {
        this.game = new TumbleHexGame();
        this.game.start();

        this.game.watch('gameover', (win) => {
            this.over = true; 
            this.win  = win;
        });
    }

    updateStatusBar() {
        this.status.innerHTML = `FPS: ${Math.round(1000 / this.game.frameDelta)}<br>LVL: ${(parseInt(localStorage.getItem('level') || 0)) + 1}`;
    }

    render() {
        return html`
            ${this.status}
            ${this.game.getContext('main:renderer').renderer.canvas}
            ${this.over ? html`<div @click="${() => window.location.reload()}" class="gameover">${this.win ? 'Nice!': 'Try Again!'}</div>` : ''}
        `;
    }
}

customElements.define('game-tumblehex', TumbleHexElement);