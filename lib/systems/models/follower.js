import { Model } from 'revelryengine/ecs/lib/model.js';

export class FollowerModel extends Model {
    static get components() {
        return {
            transform: { type: 'transform' },
            velocity:  { type: 'velocity' },
            follow:    { type: 'follow'    },
        };
    }
}

export default FollowerModel;