import { System } from 'revelryengine/ecs/lib/system.js';
import { vec3   } from 'revelryengine/renderer/deps/gl-matrix.js';

import { FollowerModel } from './models/follower.js';

export class FollowSystem extends System {
    static get models() {
        return {
            followers: { model: FollowerModel, isSet: true },
        }
    }

    update(){
        for(const follower of this.followers){
            const follow = this.stage.entities.getById(follower.follow.entity);
            if(follow) {
                const component = [...follow.components].find(({ type }) => type ==='transform');
                if(component) {
                    const target = vec3.sub(vec3.create(),component.value.translation, follower.transform.translation);
                    vec3.add(target, target, follower.follow.offset);

                    vec3.scale(follower.velocity, target, 0.1);
                }
            }
        }
    }
}

export default FollowSystem;