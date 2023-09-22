import { System    } from 'revelryengine/ecs/lib/system.js';
import { Model     } from 'revelryengine/ecs/lib/model.js';
import { PRNG      } from 'revelryengine/core/lib/utils/prng.js';
import { TileModel } from './tile.js';

const prng = new PRNG(3);

class GameOverModel extends Model {
    static components = {
        win: { type: 'gameover'  },
    }
}

export class GameOverSystem extends System {
    static models = {
        gameover: { model: GameOverModel   },
    }

    id = 'gameover';

    inactive = true;

    async onModelAdd(_, key) {
        if(key === 'gameover') {
            for(const { q, r, model } of TileModel.grid.iterateOutwards()){
                if(model) continue;

                const color = this.gameover.win ? Math.round(prng.nextFloat() * 5) : 6;
                
                await new Promise((resolve) => setTimeout(resolve));

                this.stage.createEntity({
                    transform: { translation: [0, 0.2, 0] },
                    hexcoords: { q, r },
                    color,
                });
            }
            if(this.gameover.win) {
                localStorage.setItem('level', parseInt(localStorage.getItem('level') || 0) + 1);
            }
            this.game.notify('gameover', this.gameover.win);
        }
    }
}

export default GameOverSystem;