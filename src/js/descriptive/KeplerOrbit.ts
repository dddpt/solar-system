import * as THREE from 'three'

import {AbstractOrbit} from "./AbstractOrbit"
import {EllipticOrbit} from "./EllipticOrbit"
import {TiltedOrbitalPlane} from "./OrbitalPlane"
import { Au, Msec, Rad } from '../core/spatialUnits'
import { AnimatedSpaceObject } from '../core/SpaceObject'
import { OrbiterData, SpatialObjectData } from '../data/SolarSystemData'


/** KeplerOrbit
 * 
 * Combines TiltedOrbitalPlane and EllipticOrbit together to form a proper Kepler Orbit
*/
export class KeplerOrbit extends AbstractOrbit{
  orbit: EllipticOrbit;
  plane: TiltedOrbitalPlane;
  constructor(
    epoch: Date,
    msecOrbitalPeriod: Msec,
    auSemiMajorAxis: Au,
    eccentricity: number,
    radMeanAnomaly: Rad,
    centerStandardGravitationalParameter: number,
    radInclination: Rad,
    radLongitudeOfAscendingNode: Rad,
    radArgumentOfPeriapsis: Rad,
    semiMajorAxisToOrbitRadius:((x:number)=>number)=x=>x
  ){
    super(epoch)
    this.orbit = new EllipticOrbit(epoch, msecOrbitalPeriod, auSemiMajorAxis, eccentricity, radMeanAnomaly, centerStandardGravitationalParameter , semiMajorAxisToOrbitRadius)
    this.plane = new TiltedOrbitalPlane(radInclination, radLongitudeOfAscendingNode, radArgumentOfPeriapsis)
    this.plane.add(this.orbit)
    this.object3d.add(this.plane.object3d)
    this.mobile = this.orbit.mobile
  }

  /** */
  initAnimation(newDate: Date=this.orbit.initDate){
    this.orbit.initAnimation(newDate)
  }

  /** */
  animate(msecSimulTimestamp: Msec){
    this.orbit.animate(msecSimulTimestamp)
  }

  /** */
  add(...objects: AnimatedSpaceObject[]){
    this.orbit.add(...objects)
  }
  /** */
  remove(...objects: AnimatedSpaceObject[]){
    this.orbit.remove(...objects)
  }
/** See EllipticOrbit.computeState()
 * 
 * Only applies the Kepler orbit's plane's rotations to the vector from EllipticOrbit.computeState()
   */
  computeState(msecSimulInterval: Msec, posOnOrbit: number, positionVector?: THREE.Vector3){
    const tr = this.orbit.computeState(msecSimulInterval, posOnOrbit, positionVector)
    tr.positionVector.applyQuaternion(this.plane.object3d.quaternion)
    return tr
  }

  /** compute the state of the Orbit's mobile (position, orientation, etc...) from a date
   * 
   * @param {Date} date fixed date at which to compute state
   */
  computeStateAtDate(date: Date=this.orbit.initDate){
    const tr = this.orbit.computeStateAtDate(date)
    tr.positionVector.applyQuaternion(this.plane.object3d.quaternion)
    return tr
  }

  getPosition(){
    return this.mobile.position.clone().applyQuaternion(this.plane.object3d.quaternion)
  }

  /**au/msec */
  getInstantVelocity(posOnOrbit?: number, positionVector?: THREE.Vector3){
    return this.orbit.getInstantVelocity(posOnOrbit, positionVector)
  }

  /**au/msec */
  getInstantVelocityVector(posOnOrbit?: number, positionVector?: THREE.Vector3){
    return this.orbit.getInstantVelocityVector(posOnOrbit, positionVector).applyQuaternion(this.plane.object3d.quaternion)
  }

  /** Returns path, copies the plane's object3d */
  getPath(segments: number=128, color: number= 0x222222){
    const obj = new THREE.Object3D()
    obj.copy(this.plane.object3d, false)
    const orb = this.orbit.getPath(segments, color)
    orb.position.x -=  this.orbit.ellipse.focus1.x
    obj.add(orb)
    return obj
  }

  showPath(segments: number=128, color: number= 0x222222){
    this.orbit.showPath(segments, color)
  }
  hidePath(){
    this.orbit.hidePath()
  }

  /** Creates KeplerOrbit from planet data
   * 
   * Expects o.orbitCenter.standardGravitationalParameter
   */
  static fromData(o: OrbiterData, orbitCenter: SpatialObjectData){
    return new KeplerOrbit(
      o.epoch,
      o.orbitalPeriod,
      o.semiMajorAxis,
      o.eccentricity,
      o.meanAnomaly,
      orbitCenter.standardGravitationalParameter,
      o.inclination,
      o.longitudeOfAscendingNode,
      o.argumentOfPeriapsis)//, logSemiMajorAxis)
  }
}