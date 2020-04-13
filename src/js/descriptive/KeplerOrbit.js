import * as THREE from 'three'

import {Orbit} from "./AbstractOrbit.js"
import {EllipticOrbit} from "./EllipticOrbit.js"
import {TiltedOrbitalPlane} from "./OrbitalPlane.js"


/** KeplerOrbit
 * 
 * Combines TiltedOrbitalPlane and EllipticOrbit together to form a proper Kepler Orbit
*/
export class KeplerOrbit extends Orbit{
  constructor(orbiter, epoch, msecOrbitalPeriod, auSemiMajorAxis, eccentricity, radMeanAnomaly, centerStandardGravitationalParameter, radInclination, radLongitudeOfAscendingNode, radArgumentOfPeriapsis, semiMajorAxisToOrbitRadius=x=>x){
    super()
    this.orbit = new EllipticOrbit(orbiter, epoch, msecOrbitalPeriod, auSemiMajorAxis, eccentricity, radMeanAnomaly, centerStandardGravitationalParameter , semiMajorAxisToOrbitRadius)
    this.plane = new TiltedOrbitalPlane(radInclination, radLongitudeOfAscendingNode, radArgumentOfPeriapsis, this.orbit)
    this.object3d.add(this.plane.object3d)
    this.mobile = this.orbit.mobile
  }

  /** */
  initAnimation(newDate){
    this.orbit.initAnimation(newDate)
  }

  /** */
  animate(msecSimulTimestamp){
    this.orbit.animate(msecSimulTimestamp)
  }

  /** */
  add(...objects){
    this.orbit.add(...objects)
  }
  /** */
  remove(...objects){
    this.orbit.remove(...objects)
  }
/** compute the state of the Orbit's mobile (position, orientation, etc...) from a position and time interval
   * 
   * @param {number} posOnOrbit between 0 and 1, position on orbit to compute from
   * @param {number} msecSimulInterval time interval (as msec) that for which orbit has to be computed
   * @param {THREE.Vector3} positionVector (optional) coordinates corresponding to posOnOrbit, avoids a call to getCoordinatesAt(posOnOrbit)
   */
  computeState(posOnOrbit, msecSimulInterval, positionVector = null){
    const tr = this.orbit.computeState(posOnOrbit, msecSimulInterval, positionVector)
    tr.positionVector.applyQuaternion(this.plane.object3d.quaternion)
    return tr
  }

  /** compute the state of the Orbit's mobile (position, orientation, etc...) from a date
   * 
   * @param {Date} date fixed date at which to compute state
   */
  computeStateAtDate(date){
    const tr = this.orbit.computeStateAtDate(date)
    tr.positionVector.applyQuaternion(this.plane.object3d.quaternion)
    return tr
  }

  /** Returns path, copies the plane's object3d */
  getPath(segments=128, color= 0x222222){
    const obj = new THREE.Object3D()
    obj.copy(this.plane.object3d, false)
    const orb = this.orbit.getPath(segments, color)
    orb.position.x -=  this.orbit.ellipse.focus1.x
    obj.add(orb)
    return obj
  }

  showPath(segments=128, color= 0x222222){
    this.orbit.showPath(segments, color)
  }
  hidePath(){
    this.orbit.hidePath()
  }

  /** Creates KeplerOrbit from planet data
   * 
   * Expects a o.object3d and o.orbitCenter.standardGravitationalParameter
   */
  static fromOrbiterData(o, orbitCenter){
    return new KeplerOrbit(
      o,
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