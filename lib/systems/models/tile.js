import { Model } from 'revelryengine/ecs/lib/model.js';
import { Grid  } from '../../utils/hex.js';

const grid = new Grid(6);

export class TileModel extends Model {

    static get components() {
        return {
            transform: { type: 'transform' },
            hexcoords: { type: 'hexcoords' },
            color:     { type: 'color'     },
        };
    }

    constructor(...args) {
        super(...args);

        this.hex = grid.tiles[this.hexcoords.q][this.hexcoords.r];
        this.hex.model = this;
        this.hex.color = this.color;

        this.transform.translation = [this.hex.x, 0.2, this.hex.y];
        this.transform.changed = true;
    }

    async onComponentChange(propName, newValue, oldValue) {
        switch(propName) {
            case 'color':
                this.hex.color = this.color;
                break;
            case 'hexcoords':
                const oldTile = grid.tiles[oldValue.q][oldValue.r];
                if(oldTile.model === this) {
                    delete oldTile.model;
                    delete oldTile.color;
                }

                this.hex = grid.tiles[newValue.q][newValue.r];
                this.hex.model = this;
                this.hex.color = this.color;

                this.transform.translation[0] = this.hex.x;
                this.transform.translation[2] = this.hex.y;
                this.transform.changed = true;
                
                break;
        }
    }

    static grid = grid;
}

export default TileModel;