import { System           } from 'revelryengine/ecs/lib/system.js';
import { vec2, vec3, quat } from 'revelryengine/renderer/deps/gl-matrix.js';

import { InputModel        } from './models/input.js';
import { ControllableModel } from './models/controllable.js';

export class ControllerSystem extends System {
    static get models() {
        return {
            input:        { model: InputModel        },
            controllable: { model: ControllableModel },
        }
    }
    update(deltaTime){
        if(!this.input || !this.controllable) return;
        const { keys, pointers } = this.input;

        const speed = keys.shift ? 0.4: 0.15;
        const animation = keys.shift ? 'Run' : 'Walk';

        if(keys.ArrowDown || keys.KeyS) {
            this.controllable.velocity[2] = speed;
            this.controllable.animation = { name: animation };
        }

        if(keys.ArrowRight || keys.KeyD) {
            this.controllable.velocity[0] = speed;
            this.controllable.animation = { name: animation };
        }

        if(keys.ArrowLeft || keys.KeyA) {
            this.controllable.velocity[0] = -speed;
            this.controllable.animation = { name: animation };
        }

        if(keys.ArrowUp || keys.KeyW) {
            this.controllable.velocity[2] = -speed;
            this.controllable.animation = { name: animation };
        }

        if(vec3.length(this.controllable.velocity) === 0) {
            this.controllable.animation = { name: 'Survey' };
        } else {
            let degrees = vec2.angle([this.controllable.velocity[0], this.controllable.velocity[2]], [1, 0]) * (180/Math.PI);
            if(this.controllable.velocity[2] > 0) degrees *= -1;
            this.controllable.transform.rotation = quat.fromEuler(quat.create(), 0, degrees + 90, 0);
        }

        // if(pointers.primary?.down) {
        //     const { x, y }  = pointers.primary;
        //     const { width, height } = this.stage.renderer.renderer.frustum;

        //     const center = [width / 2, height / 2];
        //     const velocity = vec2.scale([], vec2.normalize([], [x - center[0], y - center[1]]), 0.5);

        //     this.camera.velocity[0] = velocity[0];
        //     this.camera.velocity[2] = velocity[1];
        // }
    }
}

export default ControllerSystem;