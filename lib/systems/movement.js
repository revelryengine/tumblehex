import { System        } from 'revelryengine/ecs/lib/system.js';
import { vec3, mat4    } from 'revelryengine/renderer/deps/gl-matrix.js';

import { MovementModel } from './models/movement.js';

export class MovementSystem extends System {
    static get models() {
        return {
            movements: { model: MovementModel, isSet: true },
        }
    }

    update() {
        for(const movement of this.movements) {
            if(vec3.length(movement.velocity) > 0) {
                if(movement.transform.translation) {
                    vec3.add(movement.transform.translation, movement.transform.translation, movement.velocity);
                } else if(movement.transform.matrix) {
                    mat4.translate(movement.transform.matrix, movement.transform.matrix, movement.velocity);
                }
                movement.transform.changed = true;
            }
        }
    }
}

export default MovementSystem;