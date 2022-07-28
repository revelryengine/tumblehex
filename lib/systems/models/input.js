import { Model } from 'revelryengine/ecs/lib/model.js';

export class InputModel extends Model {
    static get components() {
        return {
            element: { type: 'input' },
        };
    }
}

export default InputModel;