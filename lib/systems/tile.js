import { System    } from 'revelryengine/ecs/lib/system.js';
import { Model     } from 'revelryengine/ecs/lib/model.js';
import { Node      } from 'revelryengine/gltf/lib/node.js';
import { GLTF      } from 'revelryengine/gltf/lib/gltf.js';
import { Mesh      } from 'revelryengine/gltf/lib/mesh.js';
import { Material  } from 'revelryengine/gltf/lib/material.js';

import { DEFAULT_COLORS } from '../constants.js';
import { Grid           } from '../utils/hex.js';

const grid = new Grid(6);
const gltf = await GLTF.load(new URL('../../models/tile.gltf', import.meta.url));

export const TILE_MESHES = [];
for(let i = 0; i < 7; i++) {
    TILE_MESHES.push(new Mesh({
        name: `Tile${i}`,
        primitives: [{
            ...gltf.meshes[0].primitives[0],
            material : new Material({ 
                ...gltf.meshes[0].primitives[0].material,
                pbrMetallicRoughness: {
                    baseColorFactor: DEFAULT_COLORS[i],
                },
                name: `Color${i}`,
            }),
        }],
    }));
}

export class TileModel extends Model {
    static components = {
        transform: { type: 'transform' },
        hexcoords: { type: 'hexcoords' },
        color:     { type: 'color'     },
    }

    constructor(...args) {
        super(...args);

        this.hex = grid.tiles[this.hexcoords.q][this.hexcoords.r];
        this.hex.model = this;
        this.hex.color = this.color;

        this.transform.setTranslation([this.hex.x, 0.2, this.hex.y]);

        this.node = new Node({ matrix: this.transform, mesh: TILE_MESHES[this.color] });

        this.watch('color:change', () => {
            this.hex.color = this.color;
            this.node.mesh = TILE_MESHES[this.color];
        });

        this.watch('hexcoords:change', (previous) => {
            const prevTile = grid.tiles[previous.q][previous.r];
            if(prevTile.model === this) {
                delete prevTile.model;
                delete prevTile.color;
            }

            this.hex = grid.tiles[this.hexcoords.q][this.hexcoords.r];
            this.hex.model = this;
            this.hex.color = this.color;
            
            this.transform.setTranslation([this.hex.x, 0.2, this.hex.y]);
        });
    }

    static grid = grid;
}

export class TileSystem extends System {
    static models = {
        tiles: { model: TileModel, isSet: true },
    }

    id = 'tile';

    onModelAdd(model) {
        this.stage.getContext('renderer').addGraphNode(model.node);

        model.transform.watch('change', { deferred: true, handler: () => {
            this.stage.getContext('renderer').updateGraphNode(model.node);
        } });
    }

    onModelDelete(model){
        this.stage.getContext('renderer').deleteGraphNode(model.node);

        const tile = TileModel.grid.tiles[model.hexcoords.q][model.hexcoords.r];
        delete tile.model;
        delete tile.color;
    }

    static grid = TileModel.grid;
}

export default TileSystem;