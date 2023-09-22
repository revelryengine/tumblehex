import { Stage } from 'revelryengine/ecs/lib/stage.js';
import { quat  } from 'revelryengine/renderer/deps/gl-matrix.js';
import { PRNG  } from 'revelryengine/renderer/lib/utils.js';

import { GameObjectMeta, GameObjectSystem } from 'revelryengine/core/lib/game-object.js';
import { Transform,      TransformSystem  } from 'revelryengine/core/lib/transform.js';
import { MeshAsset,      MeshSystem       } from 'revelryengine/core/lib/mesh.js';
import { RendererSystem                   } from 'revelryengine/core/lib/renderer.js';

import 'revelryengine/renderer/lib/render-paths/preview/preview-path.js';

import { InputSystem    } from '../systems/input.js';
import { ReticleSystem  } from '../systems/reticle.js';
import { TileSystem     } from '../systems/tile.js';
import { GameOverSystem } from '../systems/gameover.js';

const prng = new PRNG(parseInt(localStorage.getItem('level') || 0));

export class MainStage extends Stage {
    id = 'main';

    constructor(){
        super();

        this.initializers['meta']      = (c) => new GameObjectMeta(c.value);
        this.initializers['transform'] = (c) => new Transform(c.value);
        this.initializers['mesh']      = (c) => new MeshAsset(c);

        this.systems.add(new TransformSystem());
        this.systems.add(new GameObjectSystem());
        this.systems.add(new MeshSystem());
        this.systems.add(new RendererSystem());

        this.systems.add(new InputSystem());
        this.systems.add(new ReticleSystem());
        this.systems.add(new TileSystem());
        this.systems.add(new GameOverSystem());

        this.createRenderer();
        this.createCamera();
        this.createBoard();
        this.createTiles();
    }

    createRenderer() {
        this.createEntity({ 
            worldRender: {
                autoResize:  true,
            },
            worldInput: {
                gamepad: true, keyboard: true, pointers: true,
            },
        });
    }

    createCamera() {
        this.createEntity({
            transform: { translation: [0, 50, 0], rotation: quat.fromEuler(quat.create(), -90, 0, 0) },
            camera:    { 
                renderPath: 'preview',
                type: 'orthographic', 
                orthographic: { yfov: 45 * (Math.PI / 180), xmag: 15, ymag: 15, znear: 0.1, zfar: 100 },
            },
        });
    }

    createBoard() {
        this.createEntity({
            transform:  {},
            mesh:       { path: new URL('../../models/grid.gltf', import.meta.url) },
            grid:       {},
        });

        this.createEntity({
            transform: { translation: [0, 0.1, 0] },
            mesh:      { path: new URL('../../models/reticle.gltf', import.meta.url) },
            reticle:   {},
        });
    }

    createTiles() {
        let count = 0;
        for(const { q, r } of TileSystem.grid.iterateOutwards()){
            if((!q && !r)) continue;
            if(++count > 18) break;

            const color = Math.round(prng.nextFloat() * 5);
            this.createEntity({
                transform: {},
                hexcoords: { q, r },
                color,
            });
        }
    }
}

export default MainStage;