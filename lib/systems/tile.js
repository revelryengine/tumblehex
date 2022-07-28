import { System    } from 'revelryengine/ecs/lib/system.js';
import { GLTF      } from 'revelryengine/gltf/lib/gltf.js';
import { Node      } from 'revelryengine/gltf/lib/node.js';
import { Mesh      } from 'revelryengine/gltf/lib/mesh.js';
import { Material  } from 'revelryengine/gltf/lib/material.js';

import { DEFAULT_COLORS } from '../constants.js';
import { TileModel } from './models/tile.js';

const uri = new URL('../../models/tile.gltf', import.meta.url);

const meshesLoaded = GLTF.load(uri).then((gltf) => {
    return [...new Array(7)].map((_,i) => { 
        return new Mesh({
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
        });
    });
});

export class TileSystem extends System {

    static get models() {
        return {
            tiles: { model: TileModel, isSet: true },
        }
    }

    async onModelAdd(model){
        const meshes = await meshesLoaded;
        const mesh   = meshes[model.color];
        const node   = new Node({ mesh });
        
        model.addEventListener('componentchange', (e) => {
            const { propName, newValue } = e;

            switch(propName) {
                case 'color':
                    node.mesh = meshes[newValue];
                    model.transform.changed = true;
                    break;
            }
        });
        
        this.stage.components.add({ entity: model.entity.id, type: 'prop', value: { node } });
    }

    onModelDelete(model){
        const tile = TileModel.grid.tiles[model.hexcoords.q][model.hexcoords.r];
        delete tile.model;
        delete tile.color;
    }


    static grid = TileModel.grid;
}

export default TileSystem;