import { System } from 'revelryengine/ecs/lib/system.js';

import { CameraModel } from './models/camera.js';

export class CameraSystem extends System {
    static get models() {
        return {
            camera: { model: CameraModel },
        }
    }
}

export default CameraSystem;