import { vec3      } from 'revelryengine/core/deps/gl-matrix.js';
import { System    } from 'revelryengine/ecs/lib/system.js';
import { GLTF      } from 'revelryengine/gltf/lib/gltf.js';
import { Mesh      } from 'revelryengine/gltf/lib/mesh.js';
import { Material  } from 'revelryengine/gltf/lib/material.js';

import { DEFAULT_COLORS } from '../constants.js';
import { Grid           } from '../utils/hex.js';
import { PropModel      } from './renderer/prop.js';

const uri  = new URL('../../models/tile.gltf', import.meta.url);
const grid = new Grid(6);

export const tileMeshes = [];
tileMeshes.load = async () => {
    return GLTF.load(uri).then((gltf) => {
        for(let i = 0; i < 7; i++) {
            tileMeshes.push(new Mesh({
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
    });
} 

export class TileModel extends PropModel {

    static get components() {
        return {
            ...super.components,
            hexcoords: { type: 'hexcoords' },
            color:     { type: 'color'     },
        };
    }

    constructor(...args) {
        super(...args);

        this.hex = grid.tiles[this.hexcoords.q][this.hexcoords.r];
        this.hex.model = this;
        this.hex.color = this.color;

        this.prop.node.mesh = tileMeshes[this.color];

        vec3.set(this.transform.translation, this.hex.x, 0.2, this.hex.y);
        this.transform.commit();
    }

    async onComponentChange(propName, newValue, oldValue) {
        switch(propName) {
            case 'color':
                this.hex.color = this.color;
                this.prop.node.mesh = tileMeshes[this.color];
                break;
            case 'hexcoords':
                const oldTile = grid.tiles[oldValue.q][oldValue.r];
                if(oldTile.model === this) {
                    delete oldTile.model;
                    delete oldTile.color;
                }

                this.hex = grid.tiles[newValue.q][newValue.r];
                this.hex.model = this;
                this.hex.color = this.color;

                this.transform.translation[0] = this.hex.x;
                this.transform.translation[2] = this.hex.y;               
                break;
        }
        this.transform.commit();
    }

    static grid = grid;
}

export class TileSystem extends System {

    static get models() {
        return {
            tiles: { model: TileModel, isSet: true },
        }
    }

    onModelDelete(model){
        const tile = TileModel.grid.tiles[model.hexcoords.q][model.hexcoords.r];
        delete tile.model;
        delete tile.color;
    }

    static grid = TileModel.grid;
}

export default TileSystem;