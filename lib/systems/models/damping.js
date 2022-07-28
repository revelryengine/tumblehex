import { Model } from 'revelryengine/ecs/lib/model.js';

export class DampingModel extends Model {
    static get components() {
        return { 
            velocity: { type: 'velocity' },
            amount:   { type: 'damping'  },
        };
    }
}

export default DampingModel;