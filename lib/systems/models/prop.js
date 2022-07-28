import { AssetManager } from 'revelryengine/core/lib/asset-manager.js';
import { GLTF         } from 'revelryengine/gltf/lib/gltf.js';
import { Node         } from 'revelryengine/gltf/lib/node.js';
import { Skin         } from 'revelryengine/gltf/lib/skin.js';
import { Animation    } from 'revelryengine/gltf/lib/animation.js';

import { AsyncModel   } from './async.js';

export const gltfManager = new AssetManager((uri, abortCtl) => GLTF.load(uri, abortCtl));
export const propManager = new AssetManager(async (_, uri, abortCtl) => {
    const gltf = await gltfManager.load(uri, abortCtl);

    const scene = gltf.scene || gltf.scenes[0];

    const refs = new Map();

    for (const node of scene.depthFirstSearch()) {
        const copy = new Node({ ...node, children: node.children.map(n => refs.get(n)) });
        refs.set(node, copy);
    }

    for (const node of scene.depthFirstSearch()) {
        if(node.skin) {
            const copy = refs.get(node);
            copy.skin = new Skin({ ...node.skin, skeleton: refs.get(node.skin.skeleton), joints: node.skin.joints.map(j => refs.get(j)) });
        }
    }

    const node = new Node({ children: scene.nodes.map(n => refs.get(n)) });

    const animations = gltf.animations.map(({ name, channels, samplers }) => {
        return new Animation({ 
            name,
            channels: channels.map((channel) => {
                return { ...channel, target: { ...channel.target, node: refs.get(channel.target.node) } };
            }), 
            samplers: samplers.map((sampler) => {
                return { ...sampler };
            }),
        });
    });

    return { node, animations };
});

export class PropModel extends AsyncModel {
    static get components() {
        return {
            prop:       { type: 'prop'       },
            transform:  { type: 'transform'  },
        };
    }

    async init() {
        if(this.prop instanceof URL || typeof this.prop === 'string') {
            this.gltf = await propManager.load(this.entity, this.prop);
        } else {
            this.gltf = this.prop;
        }
        
    }
}

export class PropAnimatedModel extends PropModel {
    static get components() {
        return {
            ...super.components,
            animation:  { type: 'animation'  },
        };
    }

    async init() {
        await super.init();

        this.gltf.animators = {};

        for (const animation of this.gltf.animations) {
            this.gltf.animators[animation.name] = animation.createAnimator();
        }
    }
}

export default PropModel;