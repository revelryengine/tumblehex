import { System       } from 'revelryengine/ecs/lib/system.js';
import { Model        } from 'revelryengine/ecs/lib/model.js';
import { AssetManager } from 'revelryengine/core/lib/asset-manager.js';
import { GLTF         } from 'revelryengine/gltf/lib/gltf.js';

const assetManager = new AssetManager(async (uri, abortCtl) => {
    const response    = await fetch(uri, abortCtl);
    const contentType = response.headers.get('Content-Type');
    const buffer      = await response.arrayBuffer();

    return { response, contentType, buffer };
});

export const gltfManager = new AssetManager(async (uri, { buffer }, abortCtl) => {
    return GLTF.loadFromBuffer(buffer, uri, abortCtl);
});

export const assetManagers = {}

class AssetModel extends Model {
    static get components() {
        return {
            asset: { type: 'asset' },
        };
    }
}

export class AssetSystem extends System {
    static get models() {
        return {
            assets: { model: AssetModel, isSet: true },
        }
    }

    async onModelAdd(model) {
        model.abortCtl = new AbortController();

        const { response, contentType, buffer } = await assetManager.load(model.asset.uri, model.abortCtl);
        const type = model.asset.contentType ?? contentType;

        if(assetManagers[type]) {
            try {
                const content = await assetManagers[type].load(model.entity.id, { uri: model.asset.uri, model, buffer, response }, model.abortCtl);
                model.entity.components.add({ type, value: content });
            } catch(e) {
                if(e.name !== 'AbortError') console.error(e);
            }
        } else {
            console.warn('No asset manager for this content type', type);
        }
    }

    async onModelDelete(model) {
        model.abortCtl.abort();
    }
}

export { AssetManager };
export default AssetSystem;