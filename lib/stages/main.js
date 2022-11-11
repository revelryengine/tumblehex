import { Stage } from 'revelryengine/ecs/lib/stage.js';
import { quat  } from 'revelryengine/renderer/deps/gl-matrix.js';
import { PRNG  } from 'revelryengine/renderer/lib/utils.js';

import { CameraSystem     } from '../systems/camera.js';
import { ControllerSystem } from '../systems/controller.js';
import { DampingSystem    } from '../systems/damping.js';
import { FollowSystem     } from '../systems/follow.js';
import { MovementSystem   } from '../systems/movement.js';
import { RendererSystem   } from '../systems/renderer.js';
import { InputSystem      } from '../systems/input.js';
import { ReticleSystem    } from '../systems/reticle.js';
import { TileSystem       } from '../systems/tile.js';
import { GameOverSystem   } from '../systems/gameover.js';

const prng = new PRNG(parseInt(localStorage.getItem('level') || 0));

export class MainStage extends Stage {
    constructor({ canvas }){
        super();

        this.systems.add(new CameraSystem());
        this.systems.add(new MovementSystem());
        this.systems.add(new DampingSystem());
        this.systems.add(new FollowSystem());
        this.systems.add(new InputSystem());
        this.systems.add(new ControllerSystem());
        this.systems.add(new RendererSystem());
        this.systems.add(new ReticleSystem());
        this.systems.add(new TileSystem());
        this.systems.add(new GameOverSystem());

        this.createRenderer(canvas);
        this.createCamera();
        this.createBoard();
    }

    update(deltaTime) {
        super.update(deltaTime);
    }

    createScene() {
        this.createEntity({ 
            scene: 'default',
        });
    }

    createRenderer(canvas) {
        this.createEntity({ 
            canvas,
            input: canvas,
            renderer: {
                autoResize  : true,
                // renderScale : 1 / window.devicePixelRatio,
                // forceWebGL2 : true,
                punctual:     { enabled: false },
                ssao:         { enabled: false },
                transmission: { enabled: false },
            }
        });
    }

    createCamera() {
        this.createEntity({
            transform: { translation: [0, 50, 0], rotation: quat.fromEuler(quat.create(), -90, 0, 0) },
            camera:    { type: 'orthographic', optics: { yfov: 45 * (Math.PI / 180), xmag: 15, ymag: 15, znear: 0.1, zfar: 100 } },
        });
    }

    createBoard() {
        this.createEntity({
            transform:  { translation: [0, 0, 0], scale: [1, 1, 1] },
            prop:       new URL('../../models/grid.gltf', import.meta.url),
            grid:       {},
        }, 'grid');

        this.createEntity({
            guides:     [
                { color: 1, length: 12, chamber: 0, angle: -Math.PI / 2 }, 
                { color: 3, length: 12, chamber: 2, angle: Math.PI / 2 - (2 * Math.PI / 6) }, 
                { color: 5, length: 12, chamber: 4, angle: Math.PI / 2 + (2 * Math.PI / 6) },
            ],
            transform:  { translation: [0, 0.1, 0], scale: [1, 1, 1], rotation: [0, 0, 0, 1] },
            prop:       new URL('../../models/reticle.gltf', import.meta.url),
        }, 'reticle');

        

        this.createTiles();
    }

    createTiles() {
        let count = 0;
        for(const { q, r } of TileSystem.grid.iterateOutwards()){
            if((!q && !r)) continue;
            if(++count > 18) break;

            this.createEntity({
                transform: { translation: [0, 0.2, 0] },
                hexcoords: { q, r },
                color: Math.round(prng.nextFloat() * 5),
            });
        }
    }
}

export default MainStage;