import { Model                  } from 'revelryengine/ecs/lib/model.js';
import { KHRLightsPunctualLight } from 'revelryengine/gltf/lib/extensions/KHR_lights_punctual.js';
import { Node                   } from 'revelryengine/gltf/lib/node.js';

export class LightModel extends Model {
    static get components() {
        return { 
            light:     { type: 'light'     },
            transform: { type: 'transform' },
        };
    }

    constructor() {
        super(...arguments);

        const { light: { name, type, color, intensity, range, spot }, transform } = this;

        const light = new KHRLightsPunctualLight({ name, type, color, intensity, range, spot });
        this.gltf   = { node: new Node({ name, extensions: { KHR_lights_punctual: { light } }, ...transform }) };
    }
}

export default LightModel;