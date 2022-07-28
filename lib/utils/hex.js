import { vec2  } from 'revelryengine/renderer/deps/gl-matrix.js';
import { diff, between, normalize } from './angles.js';

/**
 * @see https://www.redblobgames.com/grids/hexagons/#coordinates-axial
 * Flat top hex, center is [0, 0], 
 */

/**
 * @see https://www.redblobgames.com/grids/hexagons/
 */
const RADIANS_PER_SIDE = (2 * Math.PI / 6);

export class AxialHex {
    constructor(q, r) {
        this.q = q;
        this.r = r;
        this.s = -q-r;
    }

    add(vec) {
        return new AxialHex(this.q + vec.q, this.r + vec.r);
    }

    scale(factor) {
        return new AxialHex(this.q * factor, this.r * factor);
    }

    neighbor(dir){
        return this.add(AxialHex.directions[dir]);
    }

    static ring(center, radius) {
        const results = [];
        let hex = center.add(AxialHex.directions[4].scale(radius));

        for(let i = 0; i < 6; i++){
            for(let j = 0; j < radius; j++){
                results.push(hex);
                hex = hex.neighbor(i);
            }
        }

        return results;
    }

    static spiral(center, radius) {
        const results = [center];
        for(let i = 1; i < radius; i++) {
            results.push(...this.ring(center, i));
        }
        return results;
    }

    static directions = [
        new AxialHex( 1, 0), new AxialHex( 0, 1), new AxialHex(-1, 1), 
        new AxialHex(-1, 0), new AxialHex( 0,-1), new AxialHex( 1,-1),
    ]
}

export class HexagonTile extends AxialHex {
    constructor(q, r) {
        super(q, r);
        this.calculatePosition();
        this.calculateAngles();
    }

    calculatePosition() {
        this.x = 3 / 2 * this.q;  
        this.y = Math.sqrt(3) / 2 * this.q + Math.sqrt(3) * this.r;
        this.d = vec2.length([this.x, this.y]); 
    }

    /**
     * Caclulates the min and max angle from the origin of all 6 vertices on the hexagon, assumes unit size of 1
     */
    calculateAngles() {
        this.angle    = Math.atan2(this.y, this.x);
        this.minAngle = Infinity;
        this.maxAngle = -Infinity;
        this.cornerAngles = [];

        let first = 0, last = 0, max = 0;
        for(let i = 0; i < 6; i++) {
            this.cornerAngles[i] = this.calculateCornerAngle(i);

            const d = Math.abs(diff(this.angle, this.cornerAngles[i]));
                if(d > max) {
                    max = d;
                    first = i;
                }
        }

        if(this.q !== 0 || this.r !== 0) {
            // find the corners that are the first angle apart
            max = 0;
            for(let i = 1; i < 6; i++) {
                const d = Math.abs(diff(this.cornerAngles[first], this.cornerAngles[(first + i) % 6]));
                if(d > max) {
                    max = d;
                    last = (first + i) % 6;
                }
            }
            
            this.minAngle = Math.min(this.cornerAngles[first], this.cornerAngles[last]);
            this.maxAngle = Math.max(this.cornerAngles[first], this.cornerAngles[last]);

            if(this.maxAngle - this.minAngle > Math.PI){
                const [a, b] = [this.minAngle, this.maxAngle];
                this.minAngle = b;
                this.maxAngle = a;
            }
        }
    }

    calculateCornerAngle(i) {
        const r = i * RADIANS_PER_SIDE;
        const x = this.x + Math.cos(r);
        const y = this.y + Math.sin(r);

        return normalize(Math.atan2(y, x));
    }
    
    withinHex(n) {
        if(this.q === 0 && this.r === 0) return true;
        const a = this.minAngle;
        const b = this.maxAngle;

        return between(a, b, n);
    }

    withinEdge(i, n) {
        const a = this.cornerAngles[i];
        const b = this.cornerAngles[(i + 1) % 6];

        return between(a, b, n);
    }
}

export class Grid {
    #allCoords;
    tiles = {};
    constructor(radius) {
        this.radius = radius;

        this.#allCoords = AxialHex.spiral(new AxialHex(0, 0), radius + 1);

        for(const { q, r } of this.#allCoords) {
            this.tiles[q]    = this.tiles[q] || {};
            this.tiles[q][r] = new HexagonTile(q, r);
        }
    }

    * iterateOutwards() {
        for(const { q, r } of this.#allCoords) {
            yield this.tiles[q][r];
        }
    }

    * iterateNeighbors(tile) {
        for(let i = 0; i < 6; i++) {
            const { q, r } = tile.neighbor(i);
            yield [i, this.tiles[q]?.[r]];
        }
    }

    floodFill(start, filter) {
        const frontier = [start];
        const reached  = new Set([start]);

        while(frontier.length) {
            const current = frontier.pop();
            for(const [,next] of this.iterateNeighbors(current)){
                if(next && !reached.has(next) && filter(next)){
                    frontier.push(next);
                    reached.add(next);
                }
            }
        }
        return reached;
    }
}