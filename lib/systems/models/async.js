import { Model } from 'revelryengine/ecs/lib/model.js';

export class AsyncModel extends Model {
    #initialized;
    #ready;

    constructor(){
        super(...arguments);

        this.#initialized = this.init().then((ready = true) => this.#ready = ready);
    }

    get initialized() {
        return this.#initialized;
    }

    get ready() {
        return this.#ready;
    }

    async init() {

    }
}

export default AsyncModel;