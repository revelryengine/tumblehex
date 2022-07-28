import { Model } from 'revelryengine/ecs/lib/model.js';

export class ControllableModel extends Model {
    static get components() {
        return {
            controllable: { type: 'controllable' },
            transform:    { type: 'transform'    },
            velocity:     { type: 'velocity'     },
            animation:    { type: 'animation'    },
        };
    }
}

export default ControllableModel;