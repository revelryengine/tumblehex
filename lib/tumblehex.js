import { html, css, LitElement } from 'lit';

import { Game      } from 'revelryengine/ecs/lib/game.js';
import { MainStage } from './stages/main.js';

class TumbleHexGame extends Game {
    constructor(canvas) {
        super();
        this.stages.add(new MainStage(canvas));
    }
}

export class TumbleHexElement extends LitElement {
    
    static get styles() {
        return css`
            :host {
                width: 100%;
                height: 100%;
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
                color: white;
                top: 5px;
                left: 5px;
            }
        `;
    }

    static get properties() {
        return {
            game: { type: Object },
        }
    }

    constructor() {
        super();
        this.canvas = document.createElement('canvas');
        this.status = document.createElement('pre');
        this.status.classList.add('status-bar')

        this.game = new TumbleHexGame({ canvas: this.canvas });
        this.game.start();

        const loop = () => {
            this.updateStatusBar();
            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop)
    }

    updateStatusBar() {
        this.status.innerHTML = `FPS: ${Math.round(1000 / this.game.frameDelta)}<br>LVL: ${(parseInt(localStorage.getItem('level') || 0)) + 1}`;
    }

    render() {
        return html`${this.canvas}${this.status}`;
    }
}

customElements.define('game-tumblehex', TumbleHexElement);