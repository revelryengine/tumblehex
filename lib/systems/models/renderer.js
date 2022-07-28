import { Renderer   } from 'revelryengine/renderer/lib/renderer.js';

import { AsyncModel } from './async.js';

export class RendererModel extends AsyncModel {
    static get components() {
        return { 
            canvas:   { type: 'canvas'   },
            settings: { type: 'renderer' },
        };
    }

    async init() {
        this.gltf = { renderer: await new Renderer(this.canvas, this.settings).initialized };
    }
}

export default RendererModel;