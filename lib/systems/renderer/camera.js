import { Model  } from 'revelryengine/ecs/lib/model.js';
import { Node   } from 'revelryengine/gltf/lib/node.js';
import { Camera } from 'revelryengine/gltf/lib/camera.js';

export class CameraModel extends Model {
    static get components() {
        return { 
            camera:    { type: 'camera'    },
            transform: { type: 'transform' },
        };
    }

    constructor() {
        super(...arguments);
        this.node = new Node({ name: this.camera.name, camera: new Camera(this.camera) });
    }
}

export default CameraModel;