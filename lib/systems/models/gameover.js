import { Model } from 'revelryengine/ecs/lib/model.js';

export class GameOverModel extends Model {
    static get components() {
        return { 
            win: { type: 'gameover'  },
        };
    }
}

export default GameOverModel;