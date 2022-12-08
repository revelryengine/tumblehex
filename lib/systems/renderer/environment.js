import { Model                     } from 'revelryengine/ecs/lib/model.js';
import { KHRLightsEnvironmentScene } from 'revelryengine/gltf/lib/extensions/KHR_lights_environment.js';

import { assetManagers, gltfManager, AssetManager } from '../asset.js';

assetManagers['model/revelry+environment'] = new AssetManager(async (_, { uri, buffer }, abortCtl) => {
    const gltf  = await gltfManager.load(uri, { buffer }, abortCtl);
    const light = gltf.extensions.KHR_lights_environment.lights[0];
    return new KHRLightsEnvironmentScene({ light });
});

export class EnvironmentModel extends Model {
    static get components() {
        return { 
            environment: { type: 'model/revelry+environment' },
        };
    }
    constructor() {
        super(...arguments);

        const { gltf } = this.stage.renderer;
        gltf.scene.extensions.KHR_lights_environment = this.environment;
        this.environment.ensureReferences(gltf, gltf.extensions.KHR_lights_environment.lights);
    }
}

export default EnvironmentModel;