import { quat, vec3 } from 'revelryengine/core/deps/gl-matrix.js';
import { System     } from 'revelryengine/ecs/lib/system.js';
import { Transform  } from 'revelryengine/core/lib/transform.js';
import { Node       } from 'revelryengine/gltf/lib/node.js';
import { normalize  } from '../utils/angles.js';

import { WorldInputModel } from './input.js';
import { PropModel       } from './renderer/prop.js';
import { tileMeshes, TileModel       } from './tile.js';

class ReticleModel extends PropModel {
    static get components() {
        return {
            ...super.components,
            guides:  { type: 'guides' },
        };
    }

    constructor() {
        super(...arguments);

        this.currents = [];
        this.chambers = [];
        this.lines    = [];
        this.colors   = [];

        for(const node of this.prop.node.depthFirstSearch()) {
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

export class ReticleSystem extends System {
    inactive = true;
    angle    = 0;
    action   = false;

    static get models() {
        return {
            input:   { model: WorldInputModel   },
            reticle: { model: ReticleModel      },
            tiles:   { model: TileModel, isSet: true },
        }
    }

    onModelAdd(model) {
        if(model instanceof ReticleModel) {
            //create center tile
            this.centerTile = this.stage.spawn(TileModel, {
                prop:      { node: new Node({ mesh: tileMeshes[6] }) },
                transform: new Transform({ translation: [0, 0.2, 0] }),
                hexcoords: { q: 0, r: 0},
                color: 6,
            });

            this.guideTiles = [];
            const vectors = [[0, -1], [1, 0], [-1, 1]];
            for(let i = 0; i < 3; i++) {
                this.guideTiles.push(this.stage.spawn(TileModel, {
                    prop:      { node: new Node({ mesh: tileMeshes[0] }) },
                    transform: new Transform({ scale: [0.5, 1.0, 0.5], translation: [0, 0.2, 0] }),
                    hexcoords: { q: vectors[i][0] * TileModel.grid.radius, r: vectors[i][1] * TileModel.grid.radius },
                    color: 0,
                }));
            }

            this.inactive = false;
        }
    }

    #lastPointerAngle = null
    update() {
        if(this.inactive) return;

        if(this.tiles.size === 4) {
            return this.gameover(true);
        }     
        const { reticle } = this;
        const { keys, pointers } = this.input;

        if(keys.ArrowRight || keys.KeyD) {
            this.angle += 5 * Math.PI / 180;
        }

        if(keys.ArrowLeft || keys.KeyA) {
            this.angle -= 5 * Math.PI / 180;
        }

        if(pointers.primary) {
            const angle = Math.atan2(pointers.primary.axisX, pointers.primary.axisY);

            if(this.#lastPointerAngle !== null) {
                this.angle -= this.#lastPointerAngle - angle;
            }
            this.#lastPointerAngle = angle;

            if(pointers.primary.out) {
                this.#lastPointerAngle = null;
            }
        }
        this.angle = normalize(this.angle);

        for(let i = 0; i < 3; i++) {
            const guideAngle = this.angle + reticle.guides[i].angle;

            const hits = [...this.tiles].filter(tile => {
                if(tile.hex.q === 1 && tile.hex.r === -1 && i === 0) {
                    tile;
                }
                return this.guideTiles.indexOf(tile) === -1 && 
                    tile.hex.withinHex(guideAngle);
            })
            const tile = hits.sort((a, b) => b.hex.d - a.hex.d)[0];

            if(tile) {
                for(const [n, neighbor] of TileModel.grid.iterateNeighbors(tile.hex)) {
                    if(neighbor.d <= tile.hex.d) continue;
                    if(neighbor.model && this.guideTiles.indexOf(neighbor.model) === -1) continue;

                    if(tile.hex.withinEdge(n, guideAngle)) {
                        const guideTile = this.guideTiles[i];
                        guideTile.hexcoords = { q: neighbor.q, r: neighbor.r };
                        guideTile.color     = reticle.guides[i].color;
                        break;
                    }
                }
            
                reticle.guides[i].length = (TileModel.grid.radius * 2) - tile.hex.d;
            }
        }

        for(let i = 0; i < reticle.guides.length; i++) {
            const { color, length, chamber } = reticle.guides[i];

            reticle.lines[i].mesh.primitives[0].material    = reticle.colors[color];
            reticle.currents[i].mesh.primitives[0].material = reticle.colors[color];
            reticle.chambers[i].mesh.primitives[0].material = reticle.colors[chamber];

            reticle.lines[i].scale = [1, 1, length];
        }

        quat.setAxisAngle(reticle.transform.rotation, [0, -1, 0], this.angle);
        this.reticle.transform.commit();

        if(!this.action && (keys.Space || pointers.primary?.click)) {
            this.action = true;
            for(const tile of this.guideTiles) {
                this.stage.spawn(TileModel, { 
                    prop:      { node: new Node({ mesh: tileMeshes[tile.color]}) },
                    transform: new Transform({}), 
                    hexcoords: { q: tile.hex.q, r: tile.hex.r }, 
                    color: tile.color,
                });

                const matches = TileModel.grid.floodFill(TileModel.grid.tiles[tile.hex.q][tile.hex.r], (neighbor) => {
                    return neighbor.color === tile.color
                });

                if(matches.size >= 3) {
                    for(const n of matches) {
                        for(const [,c] of n.model.components) {
                            this.stage.components.delete(c);
                        }
                    }
                } else if(Math.abs(tile.hex.q) >= TileModel.grid.radius || Math.abs(tile.hex.r) >= TileModel.grid.radius || Math.abs(tile.hex.s) >= TileModel.grid.radius) {
                    this.gameover(false);
                }
            }
            
            for(const guide of reticle.guides) {
                const { color, chamber } = guide;
                guide.color = chamber;
                guide.chamber = color;
            }

        } else if(!keys.Space && !pointers.primary?.click) {
            this.action = false;
        }
    }

    gameover(win) {
        const { reticle } = this;
        
        for(let i = 0; i < reticle.guides.length; i++) {
            vec3.set(reticle.transform.scale, 0, 0, 0);
            reticle.transform.commit();
        }

        for(const tile of this.tiles) {
            for(const [,c] of tile.components) {
                this.stage.components.delete(c);
            }
        }

        setTimeout(() => this.stage.createEntity({ gameover: win }), 50);

        this.inactive = true;
    }
}

export default ReticleSystem;