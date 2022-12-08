import { Stage } from 'revelryengine/ecs/lib/stage.js';
import { Node  } from 'revelryengine/gltf/lib/node.js';
import { quat  } from 'revelryengine/renderer/deps/gl-matrix.js';
import { PRNG  } from 'revelryengine/renderer/lib/utils.js';

import { Transform, TransformSystem } from 'revelryengine/core/lib/transform.js';

import { AssetSystem            } from '../systems/asset.js';
import { RendererSystem         } from '../systems/renderer/renderer.js';
import { InputSystem            } from '../systems/input.js';
import { ReticleSystem          } from '../systems/reticle.js';
import { TileSystem, tileMeshes } from '../systems/tile.js';
import { GameOverSystem         } from '../systems/gameover.js';

const prng = new PRNG(parseInt(localStorage.getItem('level') || 0));

export class MainStage extends Stage {
    constructor(){
        super('main');

        this.systems.add(new TransformSystem());

        this.systems.add(new AssetSystem());
        this.systems.add(new InputSystem());
        this.systems.add(new RendererSystem());
        this.systems.add(new ReticleSystem());
        this.systems.add(new TileSystem());
        this.systems.add(new GameOverSystem());
    }

    async load() {
        await tileMeshes.load();

        this.createRenderer();
        this.createCamera();
        this.createBoard();
    }

    update(deltaTime) {
        super.update(deltaTime);
    }

    createRenderer() {
        this.createEntity({ 
            worldRenderer: {
                autoResize  : true,
                // renderScale : 1 / window.devicePixelRatio,
                // forceWebGL2 : true,
                punctual:     { enabled: false },
                ssao:         { enabled: false },
                transmission: { enabled: false },
            },
            worldInput: {
                gamepad: true, keyboard: true, pointers: true,
            },
        });

        
    }

    createCamera() {
        this.createEntity({
            transform: new Transform({ translation: [0, 50, 0], rotation: quat.fromEuler(quat.create(), -90, 0, 0) }),
            camera:    { type: 'orthographic', orthographic: { yfov: 45 * (Math.PI / 180), xmag: 15, ymag: 15, znear: 0.1, zfar: 100 } },
        });
    }

    createBoard() {
        this.createEntity({
            transform:  new Transform({ translation: [0, 0, 0], scale: [1, 1, 1] }),
            asset:       { uri: new URL('../../models/grid.gltf', import.meta.url), contentType: 'model/revelry+prop' },
            grid:       {},
        }, 'grid');

        this.createEntity({
            guides:     [
                { color: 1, length: 12, chamber: 0, angle: -Math.PI / 2 }, 
                { color: 3, length: 12, chamber: 2, angle: Math.PI / 2 - (2 * Math.PI / 6) }, 
                { color: 5, length: 12, chamber: 4, angle: Math.PI / 2 + (2 * Math.PI / 6) },
            ],
            transform:  new Transform({ translation: [0, 0.1, 0], scale: [1, 1, 1], rotation: [0, 0, 0, 1] }),
            asset:      { uri: new URL('../../models/reticle.gltf', import.meta.url), contentType: 'model/revelry+prop' },
        }, 'reticle');

        

        this.createTiles();
    }

    createTiles() {
        let count = 0;
        for(const { q, r } of TileSystem.grid.iterateOutwards()){
            if((!q && !r)) continue;
            if(++count > 18) break;

            const color = Math.round(prng.nextFloat() * 5);
            this.createEntity({
                'model/revelry+prop': { node: new Node({ mesh: tileMeshes[color] }) },
                transform: new Transform({ translation: [0, 0.2, 0] }),
                hexcoords: { q, r },
                color,
            });
        }
    }
}

export default MainStage;