import { Model  } from 'revelryengine/ecs/lib/model.js';
import { Camera } from 'revelryengine/gltf/lib/camera.js';
import { Node   } from 'revelryengine/gltf/lib/node.js';

export class CameraModel extends Model {
    static get components() {
        return { 
            camera:    { type: 'camera'    },
            transform: { type: 'transform' },
        };
    }

    constructor() {
        super(...arguments);

        const { camera: { name, type = 'perspective', optics }, transform } = this;
        this.gltf = { node: new Node({ name, camera: new Camera({ name, type, [type]: optics }), ...transform }) };
    }
}

export default CameraModel;