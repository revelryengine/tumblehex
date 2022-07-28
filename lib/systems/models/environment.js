import { AssetManager              } from 'revelryengine/core/lib/asset-manager.js';
import { GLTF                      } from 'revelryengine/gltf/lib/gltf.js';
import { KHRLightsEnvironmentScene } from 'revelryengine/gltf/lib/extensions/KHR_lights_environment.js';

import { AsyncModel   } from './async.js';

const gltfManager = new AssetManager((uri, abortCtl) => GLTF.load(uri, abortCtl));

export class EnvironmentModel extends AsyncModel {
    static get components() {
        return { 
            environment: { type: 'environment' },
        };
    }

    async init() {
        const gltf = await gltfManager.load(this.environment);
        this.gltf  = { light: new KHRLightsEnvironmentScene({ light: gltf.extensions.KHR_lights_environment.lights[0] }) };
    }
}

export default EnvironmentModel;