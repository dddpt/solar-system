

import * as THREE from 'three'

import { ArtistsGroup } from '../artistry/Animated'
import { OrbiterData } from '../data/SolarSystemData'
import { Msec, Rad } from '../core/spatialUnits'

export class OrbitalPlane extends ArtistsGroup{
  constructor(){
    super()
  }
  
  /**ABSTRACT */
  static fromData(o: OrbiterData){
    throw "OrbitalPlane.fromData(): abstract method called"
  }
}


/** TiltedOrbitalPlane
 * 
 * Orients periapsis on the TiltedOrbitalPlane's X axis
*/
export class TiltedOrbitalPlane extends OrbitalPlane{
  longitudeOfAscendingNode: Rad;
  inclination: Rad;
  argumentOfPeriapsis: Rad;

  constructor(radInclination: Rad, radLongitudeOfAscendingNode: Rad, radArgumentOfPeriapsis: Rad){
    super()
    this.longitudeOfAscendingNode = radLongitudeOfAscendingNode
    this.inclination = radInclination
    this.argumentOfPeriapsis = radArgumentOfPeriapsis
    this.object3d.rotateY(this.longitudeOfAscendingNode)
    this.object3d.rotateX(this.inclination)
    this.object3d.rotateY(this.argumentOfPeriapsis)
  }
  /** does nothing */
  initAnimation(newDate: Date){
  }
  /** does nothing */
  animate(msecSimulTimestamp: Msec){
  }

  /** Creates TiltedOrbitalPlane from planet data
   * 
   * Expects a o.object3d
   */
  static fromData(o: OrbiterData){
    return new TiltedOrbitalPlane(
      o.inclination,
      o.longitudeOfAscendingNode,
      o.argumentOfPeriapsis)
  }
}