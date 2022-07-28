import { System        } from 'revelryengine/ecs/lib/system.js';
import { PRNG          } from 'revelryengine/renderer/lib/utils.js';
import { GameOverModel } from './models/gameover.js';
import { InputModel    } from './models/input.js';
import { TileModel     } from './models/tile.js';

const prng = new PRNG(3);

export class GameOverSystem extends System {
    inactive = true;
    static get models() {
        return {
            input:    { model: InputModel   },
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
        if(!this.#tilesAdded) {
            for(const { q, r, model } of TileModel.grid.iterateOutwards()){
                if(model) continue;
    
                this.stage.createEntity({
                    transform: { translation: [0, 0.2, 0] },
                    hexcoords: { q, r },
                    color: this.gameover.win ? Math.round(prng.nextFloat() * 5) : 6,
                });
            }
            this.#tilesAdded = true;
        }
    }
}

export default GameOverSystem;