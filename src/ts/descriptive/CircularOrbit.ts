import * as THREE from 'three'

import {AbstractOrbit} from "./AbstractOrbit"
import {Msec, Au, Rad} from "../core/spatialUnits"
import { OrbiterData, SpatialObjectData } from '../data/SolarSystemData'
import { SpatialObjectState } from '../core/SpaceObject'

const twoPi = 2*Math.PI


export function rotateY(v: THREE.Vector3, angle: number){
  const quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), angle)

}

/** CircularOrbit
 * 
 * no computeState() workflow, initAnimation() doesn't take newDate into account
  */
 export class CircularOrbit extends AbstractOrbit<SpatialObjectState>{
  orbitalPeriod: Msec
  semiMajorAxis: Au
  meanAnomaly: Rad
  orbitRadius: Au
  yAngleSpeedFactor: number
  lastAnimateTimestamp: number
  data: OrbiterData;
  initialTimestamp: number;
  _initialState: SpatialObjectState;
  constructor(
    id: string,
    orbitCenterId: string,
    initDate: Date,
    msecOrbitalPeriod: Msec,
    auSemiMajorAxis: Au,
    radMeanAnomaly: Rad,
    semiMajorAxisToOrbitRadius:((x:number)=>number)=x=>x,
    data?: OrbiterData
  ){
    const initialPosition = new THREE.Vector3(1,0,0)
    initialPosition.applyAxisAngle(new THREE.Vector3(0,1,0), radMeanAnomaly)
    super(id, orbitCenterId, data)
    this.orbitalPeriod = msecOrbitalPeriod
    this.semiMajorAxis = auSemiMajorAxis
    this.meanAnomaly = radMeanAnomaly
    this.orbitRadius = semiMajorAxisToOrbitRadius(auSemiMajorAxis)
    this.yAngleSpeedFactor = twoPi / this.orbitalPeriod
    this.initialTimestamp=+initDate
    this._initialState=null
  }

  initialize(){
    this.getInitialState()
  }

  getInitialState(): SpatialObjectState {
    const initialPosition = new THREE.Vector3(1,0,0)
    initialPosition.applyAxisAngle(new THREE.Vector3(0,1,0), this.meanAnomaly)
    this._initialState = new SpatialObjectState(
      this.initialTimestamp,
      initialPosition,
      (new THREE.Vector3(1,0,0)).multiplyScalar(this.orbitRadius*this.yAngleInInterval(1)), // TOCHECK
      (new THREE.Quaternion()).setFromAxisAngle(new THREE.Vector3(0,1,0), -this.meanAnomaly)
    )
    return this._initialState
  }

  yAngleInInterval(msecInterval: number){
    return (msecInterval * this.yAngleSpeedFactor) % twoPi
  }
  yAngleBetweenTimestamps(msecSimulTimestamp1: number, msecSimulTimestamp2: number){
    return this.yAngleInInterval(msecSimulTimestamp2-msecSimulTimestamp1)
  }

  getState(timestamp: Msec){
    return this.computeState(timestamp)
  }

  /** compute the state of the Orbit's mobile (position, orientation, etc...) from a position and time interval
  * 
  * Doesn't affect the state of the Elliptic Orbit (doesn't update this.mobile.position), call initAnimation()/animate() for that
  * @param {number} posOnOrbit between 0 and 1, position on orbit to compute from
  * @param {number} msecSimulInterval time interval (as msec) that for which orbit has to be computed
  * @param {THREE.Vector3} positionVector (optional) coordinates corresponding to posOnOrbit, avoids a call to getCoordinatesAt(posOnOrbit)
  */
  computeState(timestamp: Msec){
    const yAngle = this.yAngleBetweenTimestamps(this._initialState.timestamp, timestamp)
    const position = this._initialState.position.clone()
    position.applyAxisAngle(new THREE.Vector3(0,1,0), yAngle)
    return new SpatialObjectState(
      timestamp,
      position,
      // TODO: correctly orient velocity vector (and properly check velocity...)
      (new THREE.Vector3(1,0,0)).multiplyScalar(this.orbitRadius*this.yAngleInInterval(1)),
      (new THREE.Quaternion()).setFromAxisAngle(new THREE.Vector3(0,1,0),0) // rotation 0
    )
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
  static fromData(
    o: OrbiterData, orbitCenter: SpatialObjectData, 
    semiMajorAxisToOrbitRadius:((x:number)=>number)=x=>x
  ){
    return new CircularOrbit(
      o.id,
      o.orbitCenterId,
      o.epoch,
      o.orbitalPeriod,
      o.semiMajorAxis,
      o.meanAnomaly,
      semiMajorAxisToOrbitRadius,
      o
    )
  }
}