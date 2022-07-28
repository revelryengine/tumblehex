import { Model } from 'revelryengine/ecs/lib/model.js';

export class MovementModel extends Model {
    static get components() {
        return { 
            velocity:  { type: 'velocity'  },
            transform: { type: 'transform' },
        };
    }
}

export default MovementModel;