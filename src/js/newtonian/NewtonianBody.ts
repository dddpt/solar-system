
import * as THREE from 'three'

import { AnimatedSpaceObjectsGroup } from '../core/SpaceObject'
import { KeplerOrbit } from '../descriptive/KeplerOrbit'
import { Au, Kg } from '../core/spatialUnits';
import { OrbiterData, SpatialObjectData } from '../data/SolarSystemData';
import { tconsole } from '../utils';

export class NewtonianBody{
  mass: Kg;
  position: THREE.Vector3; // Au
  speed: THREE.Vector3;
  acceleration: THREE.Vector3;
  force: THREE.Vector3;

  /** NewtonianBody: represents an object affected by gravity
   * 
   * @param {number} kgMass 
   * @param {THREE.Vector3} auPosition
   * @param {THREE.Vector3} auPerMsecSpeed
   * @param {THREE.Vector3} auPerMsec2Acceleration defaults to (0,0,0)
   */
  constructor(kgMass: Kg, auPosition: THREE.Vector3, auPerMsecSpeed: THREE.Vector3, auPerMsec2Acceleration?: THREE.Vector3){
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

  static fromData(o:OrbiterData, orbitCenter: SpatialObjectData){
    const ko = KeplerOrbit.fromData(o, orbitCenter)
    ko.initAnimation()
    tconsole.log("NewtonianBody.fromData("+o.name+"): ko.getPosition()", ko.getPosition(), "ko.getInstantVelocityVector()", ko.getInstantVelocityVector())
    return new NewtonianBody(
      o.mass,
      ko.getPosition(),
      ko.getInstantVelocityVector()
    )
  }
}

export class AnimatedNewtonianBody extends AnimatedSpaceObjectsGroup{
  data: NewtonianBody;
  /** AnimatedNewtonianBody
   */
  constructor(newtonianBody: NewtonianBody){
    super(new THREE.Group())
    this.data = newtonianBody
    // use same reference for object3d and nb data
    this.object3d.position.x = this.data.position.x
    this.object3d.position.y = this.data.position.y
    this.object3d.position.z = this.data.position.z
    this.data.position = this.object3d.position
  }

  clone(): AnimatedNewtonianBody{
    return new AnimatedNewtonianBody(this.data.clone())
  }
}