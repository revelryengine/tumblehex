import { System          } from 'revelryengine/ecs/lib/system.js';
import { Model           } from 'revelryengine/ecs/lib/model.js';
import { PRNG            } from 'revelryengine/core/lib/utils/prng.js';
import { Transform       } from 'revelryengine/core/lib/transform.js';
import { WorldInputModel } from './input.js';
import { TileModel       } from './tile.js';


const prng = new PRNG(3);

class GameOverModel extends Model {
    static get components() {
        return { 
            win: { type: 'gameover'  },
        };
    }
}

export class GameOverSystem extends System {
    inactive = true;
    static get models() {
        return {
            input:    { model: WorldInputModel   },
            gameover: { model: GameOverModel },
            tiles:    { model: TileModel, isSet: true },
        }
    }

    onModelAdd(model) {
        if(model instanceof GameOverModel) {
            this.inactive = false;
        }
    }

    #tilesAdded = false;
    update() {
        if(this.inactive) return;
        if(!this.#tilesAdded) {
            for(const { q, r, model } of TileModel.grid.iterateOutwards()){
                if(model) continue;

                const color = this.gameover.win ? Math.round(prng.nextFloat() * 5) : 6;
    
                this.stage.createEntity({
                    prop:      { node: new Node({ mesh: tileMeshes[color] }) },
                    transform: new Transform({ translation: [0, 0.2, 0] }),
                    hexcoords: { q, r },
                    color,
                });
            }
            if(this.gameover.win) {
                localStorage.setItem('level', parseInt(localStorage.getItem('level') || 0) + 1);
            }
            this.#tilesAdded = true;
        }
    }
}

export default GameOverSystem;