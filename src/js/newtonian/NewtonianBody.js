
import * as THREE from 'three'

import { AnimatedSpaceObjectsGroup } from '../core/SpaceObject.js'
import { KeplerOrbit } from '../descriptive/KeplerOrbit.js'

export class NewtonianBody{
  /** NewtonianBody: represents an object affected by gravity
   * 
   * @param {number} kgMass 
   * @param {THREE.Vector3} auPosition
   * @param {THREE.Vector3} auPerMsecSpeed
   * @param {THREE.Vector3} auPerMsec2Acceleration defaults to (0,0,0)
   */
  constructor(kgMass, auPosition, auPerMsecSpeed, auPerMsec2Acceleration=false){
    this.mass = kgMass
    this.position = auPosition
    this.speed = auPerMsecSpeed
    this.acceleration = auPerMsec2Acceleration? auPerMsec2Acceleration : new THREE.Vector3()
    this.force = this.acceleration.clone().multiplyScalar(this.mass)
    //console.log("new NewtonianBody(mass=",kgMass,", pos=",auPosition.clone(),", spd=",auPerMsecSpeed.clone(), ", acc=", this.acceleration.clone(),")")
  }

  clone(){
    return new NewtonianBody(this.mass, this.position.clone(), this.speed.clone(), this.acceleration.clone())
  }

  static fromData(o, orbitCenter){
    const ko = KeplerOrbit.fromData(o, orbitCenter)
    ko.initAnimation()
    return new NewtonianBody(
      o.mass,
      ko.getPosition(),
      ko.getInstantVelocityVector()
    )
  }
}

export class AnimatedNewtonianBody extends AnimatedSpaceObjectsGroup{
  /** AnimatedNewtonianBody
   */
  constructor(newtonianBody){
    super(new THREE.Group())
    this.data = newtonianBody
    // use same reference for object3d and nb data
    this.object3d.position.x = this.data.position.x
    this.object3d.position.y = this.data.position.y
    this.object3d.position.z = this.data.position.z
    this.data.position = this.object3d.position
  }
}