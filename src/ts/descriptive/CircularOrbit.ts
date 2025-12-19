import * as THREE from 'three'

import {AbstractOrbit} from "./AbstractOrbit"
import {Msec, Au, Rad} from "../core/spatialUnits"

const twoPi = 2*Math.PI

/** CircularOrbit
 * 
 * no computeState() workflow, initAnimation() doesn't take newDate into account
  */
 export class CircularOrbit extends AbstractOrbit{
  orbitalPeriod: Msec
  semiMajorAxis: Au
  meanAnomaly: Rad
  orbitRadius: Au
  yAngleSpeedFactor: number
  lastAnimateTimestamp: number
  constructor(initDate: Date, msecOrbitalPeriod: Msec, auSemiMajorAxis: Au, radMeanAnomaly: Rad, semiMajorAxisToOrbitRadius:((x:number)=>number)=x=>x){
    super(initDate)

    this.orbitalPeriod = msecOrbitalPeriod
    this.semiMajorAxis = auSemiMajorAxis
    this.meanAnomaly = radMeanAnomaly
    this.orbitRadius = semiMajorAxisToOrbitRadius(this.semiMajorAxis)
    this.yAngleSpeedFactor = twoPi / this.orbitalPeriod
    this.lastAnimateTimestamp = 0
  }

  yAngleAtMsecTimestamp(msecSimulTimestamp: number){
    return (msecSimulTimestamp * this.yAngleSpeedFactor) % twoPi
  }
  yAngleInInterval(msecSimulTimestamp1: number, msecSimulTimestamp2: number){
    return this.yAngleAtMsecTimestamp(msecSimulTimestamp2-msecSimulTimestamp1)
  }

  /** Resets mobile position to initDate position
   * 
   * doesn't take newDate into account*/
  initAnimation(newDate: Date){
      this.mobile.position.x = this.orbitRadius
      this.object3d.rotateY(this.meanAnomaly)
      this.mobile.rotateY(-this.meanAnomaly)
  }

  /** */
  animate(msecSimulTimestamp: number){
    const yAngle = this.yAngleInInterval(this.lastAnimateTimestamp, msecSimulTimestamp)
    this.object3d.rotateY(yAngle)
    this.mobile.rotateY(-yAngle)
    this.lastAnimateTimestamp = msecSimulTimestamp
    this.currentSimulTimestamp += msecSimulTimestamp- this.lastAnimateTimestamp
  }


  /** compute the state of the Orbit's mobile (position, orientation, etc...) from a position and time interval
  * 
  * Doesn't affect the state of the Elliptic Orbit (doesn't update this.mobile.position), call initAnimation()/animate() for that
  * @param {number} posOnOrbit between 0 and 1, position on orbit to compute from
  * @param {number} msecSimulInterval time interval (as msec) that for which orbit has to be computed
  * @param {THREE.Vector3} positionVector (optional) coordinates corresponding to posOnOrbit, avoids a call to getCoordinatesAt(posOnOrbit)
  */
  computeState(msecSimulInterval: Msec){
    throw "CircularOrbit: computeState not implemented() TODO"
    return {posOnOrbit: 0, positionVector: new THREE.Vector3}
  }

  /** compute the state of the Orbit's mobile (position, orientation, etc...) from a date
  * 
  * Doesn't affect the state of the Elliptic Orbit (doesn't update this.mobile.position), call initAnimation()/animate() for that
  * @param {Date} date fixed date at which to compute state
  */
  computeStateAtDate(date: Date=this.initDate){
    throw "CircularOrbit: computeStateAtDate not implemented() TODO"
    return {posOnOrbit: 0, positionVector: new THREE.Vector3}
  }

  getPath(segments=128, color= 0x222222){
    let material = new THREE.LineBasicMaterial( { color } )
    let geometry = new THREE.CircleGeometry( this.orbitRadius, segments )
    // Remove center vertex

    //@ts-ignore TODO it seems geometry.vertices is no longer accessible, to see if it fails
    const vertices = geometry.vertices as Array<number>
    vertices.shift()
    let orbitCircle = new THREE.LineLoop( geometry, material )
    return orbitCircle
  }

  /** Creates CircularOrbit from planet data
   * 
   * Expects a o.object3d
   */
  static fromData(o, orbitCenter){
    return new CircularOrbit(
      o.epoch,
      o.orbitalPeriod,
      o.semiMajorAxis,
      o.radMeanAnomaly,
    )
  }
}