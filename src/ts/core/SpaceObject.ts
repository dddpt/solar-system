import * as THREE from 'three'
import { Msec } from './spatialUnits'

/** Animated: has 2 methods relevant for three.js animation: initAnimation() and animate()
 */
export abstract class Animated{
  constructor(){
  }
  /**ABSTRACT initAnimation() prepares the animation for a given date*/
  abstract initAnimation(newDate: Date): void;

  /**ABSTRACT animate() animates the object for the given secSimulTimestamp*/
  abstract animate(msecSimulTimestamp: Msec): void;
}

/** AnimatedSpaceObject: simply an object having an three.js object3d property
 * 
 * extends Animated
 */
export abstract class AnimatedSpaceObject extends Animated{
  object3d: THREE.Object3D
  constructor(object3d : THREE.Object3D){
    super()
    this.object3d = object3d
  }
}

/** AnimatedSpaceObjectsGroup: an AnimatedSpaceObject with children AnimatedSpaceObject
 * 
 * takes care of propagating animate() and initAnimation() to children
 */
export class AnimatedSpaceObjectsGroup extends AnimatedSpaceObject{
  mobile: THREE.Object3D
  children: AnimatedSpaceObject[]
  constructor(object3d: THREE.Object3D){
    super(object3d)
    this.mobile = object3d // by default: no mobile and hence this.mobile = this.object3d
    this.children = []
  }
  
  /** */
  initAnimation(newDate: Date){
    this.children.forEach(o=>{
      o.initAnimation(newDate)
    })
  }
  /** does nothing */
  animate(msecSimulTimestamp: Msec){
    this.children.forEach(o=>{
      o.animate(msecSimulTimestamp)
    })
  }

  /** */
  add(...children: AnimatedSpaceObject[]){
    const self = this
    children = children.filter(o=>!self.children.includes(o))
    this.children = this.children.concat(children)
    children.forEach(o=>{
      if (o.object3d){
        self.mobile.add(o.object3d)
      }
      else{
        throw "AnimatedSpaceObjectsGroup.add() missing object3d for: "+o
      }
    })
  }
  /** */
  remove(...children: AnimatedSpaceObject[]){
    const self = this
    this.children = this.children.filter(o=>!children.includes(o))
    children.forEach(o=>{
      self.mobile.remove(o.object3d)
    })
  }

}