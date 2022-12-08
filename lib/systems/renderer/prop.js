import { Model     } from 'revelryengine/ecs/lib/model.js';
import { Node      } from 'revelryengine/gltf/lib/node.js';
import { Skin      } from 'revelryengine/gltf/lib/skin.js';
import { Animation } from 'revelryengine/gltf/lib/animation.js';

import { assetManagers, gltfManager, AssetManager } from '../asset.js';

assetManagers['model/revelry+prop'] = new AssetManager(async (_, { uri, buffer }, abortCtl) => {
    const gltf = await gltfManager.load(uri, { buffer }, abortCtl);

    const scene = gltf.scene ?? gltf.scenes[0];

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
    const animations = gltf.animations?.map(({ name, channels, samplers }) => {
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

export class PropModel extends Model {
    static get components() {
        return { 
            prop:      { type: 'model/revelry+prop' },
            transform: { type: 'transform'          },
        };
    }
    
    get node () {
        return this.prop.node;
    }

    get animations () {
        return this.prop.animations;
    }
}

export class PropAnimatedModel extends PropModel {
    static get components() {
        return {
            ...super.components,
            animation: { type: 'animation' },
        };
    }

    constructor() {
        super(...arguments);
        
        this.animators = {};

        for (const animation of this.animations) {
            this.animators[animation.name] = animation.createAnimator();
        }
    }

    onComponentChange(prop, newValue) {
        if(prop === 'animation') {
            this.animators[newValue.name].time = 0;
        }
    }
}

export default PropModel;