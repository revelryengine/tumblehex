import { Model } from 'revelryengine/ecs/lib/model.js';
import { Node  } from 'revelryengine/gltf/lib/node.js';

import { KHRLightsPunctualLight } from 'revelryengine/gltf/lib/extensions/KHR_lights_punctual.js';

export class LightModel extends Model {
    static get components() {
        return { 
            light:     { type: 'light'     },
            transform: { type: 'transform' },
        };
    }

    constructor() {
        super(...arguments);
        this.node = new Node({ name: this.light.name, extensions: { KHR_lights_punctual: { light: new KHRLightsPunctualLight(this.light) } } });
    }
}

export default LightModel;