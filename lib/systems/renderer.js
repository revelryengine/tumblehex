import { System } from 'revelryengine/ecs/lib/system.js';
import { GLTF   } from 'revelryengine/gltf/lib/gltf.js';

import { RendererModel    } from './models/renderer.js';
import { CameraModel      } from './models/camera.js';
import { EnvironmentModel } from './models/environment.js';
import { LightModel       } from './models/light.js';
import { PropAnimatedModel, PropModel } from './models/prop.js';


export class RendererSystem extends System {
    inactive = true;

    static get models() {
        return {
            renderer:    { model: RendererModel    },
            camera:      { model: CameraModel      },
            environment: { model: EnvironmentModel },
            lights:      { model: LightModel,        isSet: true },
            props:       { model: PropModel,         isSet: true },
            animatables: { model: PropAnimatedModel, isSet: true },
        }
    }

    constructor() {
        super(...arguments);

        this.gltf = new GLTF({ 
            asset: { 
                version: '2.0', generator: 'Reverly Engine Runtime Generation',
            },
            scenes: [{ name: 'Revelry Engine Runtime Scene' }],
            scene: 0,
            extensions_used: ['KHR_lights_environment'],
            extensions: {
                KHR_lights_environment: {
                    lights: [],
                }
            }
        });
    }

    onModelAdd(model) {
        if(model instanceof RendererModel) {
            this.createRenderer(model);
        } else if(model instanceof EnvironmentModel) {
            this.createEnvironment(model);
        } else if(model instanceof PropModel) {
            this.createProp(model);
        } else if(model instanceof CameraModel) {
            this.gltf.scene.nodes.push(model.gltf.node);
            model.gltf.node.ensureReferences(this.gltf, this.gltf.nodes);
        } else if(model instanceof LightModel) {
            this.gltf.scene.nodes.push(model.gltf.node);
            model.gltf.node.ensureReferences(this.gltf, this.gltf.nodes);
        }
    }

    onModelDelete(model) {
        if(model instanceof PropModel) {
            this.gltf.scene.nodes.splice(this.gltf.scene.nodes.indexOf(model.gltf.node), 1);
            this.graph.deleteNode(model.gltf.node);
        }
    }

    async createRenderer(model) {
        await model.initialized;

        this.frustum = model.gltf.renderer.createFrustum(),
        this.graph   = model.gltf.renderer.getSceneGraph(this.gltf.scene);

        this.inactive = false;
    }

    async createEnvironment(model) {
        await model.initialized;

        const { light } = model.gltf;

        this.gltf.scene.extensions.KHR_lights_environment = light;
        light.ensureReferences(this.gltf, this.gltf.extensions.KHR_lights_environment.lights);
    }

    async createProp(model) {
        await model.initialized;

        const { node      } = model.gltf;
        const { transform } = model;

        this.gltf.scene.nodes.push(node);
        transform.changed = true;
    }

    update(hrTime) {
        if(this.camera) {
            this.updateGraphNode(this.camera.gltf.node, this.camera.transform);

            this.frustum.update({ 
                graph      : this.graph, 
                cameraNode : this.camera.gltf.node, 
                width      : this.renderer.gltf.renderer.width, 
                height     : this.renderer.gltf.renderer.height,
            });
        }

        for(const { gltf, transform } of this.lights) {
            gltf && this.updateGraphNode(gltf.node, transform);
        }

        for(const { gltf, transform } of this.props) {
            gltf && this.updateGraphNode(gltf.node, transform);
        }

        for(const animatable of this.animatables){
            const animator = animatable.gltf?.animators[animatable.animation.name];
            if(animator) {
                const { nodes, materials } = animator.targets;
                animator.update(hrTime);
                if(nodes) this.graph.updateNodes(nodes, animatable.gltf.node);
                if(materials) this.graph.updateMaterials(materials);
            }
        }
    }

    updateGraphNode(node, transform, force) {
        if(transform.changed || force) {
            Object.assign(node, transform);
            this.graph.updateNode(node);
            transform.changed = false; /** @todo move this elsewhere in case other systems care if a transform has changed? */
        }
    }

    render() {
        this.renderer.gltf.renderer.render(this.graph, this.frustum);
    }
}

export default RendererSystem;