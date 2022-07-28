import { System       } from 'revelryengine/ecs/lib/system.js';
import { vec3         } from 'revelryengine/renderer/deps/gl-matrix.js';
import { DampingModel } from './models/damping.js';

const EPSILON = 0.01;

export class DampingSystem extends System {
    static get models() {
        return {
            dampings: { model: DampingModel, isSet: true },
        }
    }

    update(){
        for(const damping of this.dampings) {
            const length = vec3.length(damping.velocity);
            if(length > 0) {
                if(length < EPSILON) {
                    vec3.zero(damping.velocity);
                } else {
                    vec3.scale(damping.velocity, damping.velocity, damping.amount);
                }
            }
        }
    }
}

export default DampingSystem;