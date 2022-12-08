import { System } from 'revelryengine/ecs/lib/system.js';
import { Model  } from 'revelryengine/ecs/lib/model.js';
import { GLTF   } from 'revelryengine/gltf/lib/gltf.js';

import { Renderer } from 'revelryengine/renderer/lib/renderer.js';

import { EnvironmentModel } from './environment.js';
import { CameraModel      } from './camera.js';
import { LightModel       } from './light.js';

import { PropModel, PropAnimatedModel } from './prop.js';

await Renderer.requestDevice();

class WorldRendererModel extends Model {
    static get components() {
        return { 
            settings: { type: 'worldRenderer' },
        };
    }
    
    constructor() {
        super(...arguments);

        this.renderer = new Renderer(this.settings, this.stage.renderer.canvas);

        this.frustum = this.renderer.createFrustum(),
        this.graph   = this.renderer.getSceneGraph(this.stage.renderer.gltf.scene);

        this.stage.frustum = this.frustum;
    }
}

export class RendererSystem extends System {
    get inactive() {
        return !this.worldRenderer?.renderer;
    }

    static get models() {
        return {
            worldRenderer: { model: WorldRendererModel },
            environment:   { model: EnvironmentModel   },

            camera:        { model: CameraModel                    },
            lights:        { model: LightModel,        isSet: true },
            props:         { model: PropModel,         isSet: true },
            animatables:   { model: PropAnimatedModel, isSet: true },
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

        this.canvas = document.createElement('canvas');
    }

    onModelAdd(model, key) {
        switch(key) {
            case 'lights':  
            case 'camera':
            case 'props':
                this.gltf.scene.nodes.push(model.node);
                model.node.ensureReferences(this.gltf, this.gltf.nodes);

                model.watcher = model.transform.watch((t) => {
                    this.updateGraphNode(model.node, t);
                });
                this.updateGraphNode(model.node, model.transform);
                break;
        }
    }

    onModelDelete(model, key) {
        switch(key) {
            case 'lights':  
            case 'camera':
            case 'props':
                this.gltf.scene.nodes.splice(this.gltf.scene.nodes.indexOf(model.node), 1);
                this.worldRenderer.graph.deleteNode(model.node);
                model.transform.unwatch(model.watcher);
                break;
        }
    }

    connectedCallback() {
        this.stage.renderer = this;
    }


    update(hrTime) {
        if(this.inactive) return;

        if(this.camera) {
            const { node } = this.camera;
            const { graph, renderer: { width, height } } = this.worldRenderer;
            this.worldRenderer.frustum.update({ graph, width, height, cameraNode: node });
        }        

        for(const animatable of this.animatables){
            const animator = animatable.animators[animatable.animation.name];
            if(animator) {
                const { nodes, materials } = animator.targets;
                animator.update(hrTime);
                if(nodes) this.worldRenderer.graph.updateNodes(nodes, animatable.node);
                if(materials) this.worldRenderer.graph.updateMaterials(materials);
            }
        }
    }

    updateGraphNode(node, transform) {
        node.matrix = transform;
        this.worldRenderer.graph.updateNode(node);
    }

    render() {
        if(this.inactive) return;
        this.worldRenderer.renderer.render(this.worldRenderer.graph, this.worldRenderer.frustum);
    }
}

export default RendererSystem;