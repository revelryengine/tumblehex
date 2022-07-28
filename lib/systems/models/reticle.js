import { PropModel } from './prop.js';

export class ReticleModel extends PropModel {
    static get components() {
        return {
            ...super.components,
            guides:  { type: 'guides' },
        };
    }

    async init() {
        await super.init();

        this.currents = [];
        this.chambers = [];
        this.lines    = [];
        this.colors   = [];

        for(const node of this.gltf.node.depthFirstSearch()) {
            if(node.name?.startsWith('Current.')){
                this.currents[Number(node.name.at(-1))] = node;
            }
            if(node.name?.startsWith('Chamber.')){
                this.chambers[Number(node.name.at(-1))] = node;
            }
            if(node.name?.startsWith('Line.')){
                this.lines[Number(node.name.at(-1))] = node;
            }
            if(node.mesh?.primitives[0].material.name.startsWith('Color.')) {
                this.colors[Number(node.mesh.primitives[0].material.name.at(-1))] = node.mesh.primitives[0].material;
            }
        }
    }
}

export default ReticleModel;