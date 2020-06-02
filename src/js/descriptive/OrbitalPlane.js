

import * as THREE from 'three'

import { AnimatedSpaceObjectsGroup } from '../core/SpaceObject.js'

export class OrbitalPlane extends AnimatedSpaceObjectsGroup{
  constructor(){
    super(new THREE.Group())
  }
  
  /**ABSTRACT */
  static fromData(o){
    throw "OrbitalPlane.fromData(): abstract method called"
  }
}


/** TiltedOrbitalPlane
 * 
 * Orients periapsis on the TiltedOrbitalPlane's X axis
*/
export class TiltedOrbitalPlane extends OrbitalPlane{
  constructor(radInclination, radLongitudeOfAscendingNode, radArgumentOfPeriapsis){
    super()
    this.longitudeOfAscendingNode = radLongitudeOfAscendingNode
    this.inclination = radInclination
    this.argumentOfPeriapsis = radArgumentOfPeriapsis
    this.object3d.rotateY(this.longitudeOfAscendingNode)
    this.object3d.rotateX(this.inclination)
    this.object3d.rotateY(this.argumentOfPeriapsis)
  }
  /** does nothing */
  initAnimation(newDate){
  }
  /** does nothing */
  animate(msecSimulTimestamp){
  }

  /** Creates TiltedOrbitalPlane from planet data
   * 
   * Expects a o.object3d
   */
  static fromData(o){
    return new TiltedOrbitalPlane(
      o.inclination,
      o.longitudeOfAscendingNode,
      o.argumentOfPeriapsis)
  }
}