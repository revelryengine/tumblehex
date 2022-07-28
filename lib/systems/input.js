import { System        } from 'revelryengine/ecs/lib/system.js';
import { GamepadState  } from 'revelryengine/core/lib/input/gamepad.js';
import { PointerState  } from 'revelryengine/core/lib/input/pointer.js';
import { KeyboardState } from 'revelryengine/core/lib/input/keyboard.js';

import { InputModel } from './models/input.js';

export class InputSystem extends System {
    static get models() {
        return {
            input: { model: InputModel },
        }
    }

    onModelAdd(model) {
        model.gamepads = [];

        window.addEventListener('gamepadconnected', (e) => {
            console.debug("Gamepad connected at index %d: %s. %d buttons, %d axes.",
                e.gamepad.index, e.gamepad.id,
                e.gamepad.buttons.length, e.gamepad.axes.length, e.gamepad);

            model.gamepads[e.gamepad.index] = new GamepadState(e.gamepad);
        });

        window.addEventListener("gamepaddisconnected", (e) => {
            console.debug("Gamepad disconnected at index %d.", e.gamepad.index);

            model.gamepads[e.gamepad.index] = null;
        });

        model.pointers = (new PointerState(model.element)).pointers;

        model.keys = (new KeyboardState(window)).keys;
    }

    update(deltaTime){
        if(!this.input) return;
        const gamepads = navigator.getGamepads();
        for(const gamepad of gamepads) {
            if(gamepad && this.input.gamepads[gamepad.index]) {
                const state = this.input.gamepads[gamepad.index];
                state.update(gamepad, deltaTime);
            }
        }
    }
}

export default InputSystem;