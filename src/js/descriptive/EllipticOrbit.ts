import * as THREE from 'three'

import {AbstractOrbit} from "./AbstractOrbit"
import {msec, sec, d,w, month, yr, Msec, Au, Rad} from "../core/spatialUnits"
import {mod, eccentricAnomalyNewtonsMethod, binarySearch, Ellipse, tconsole} from "../utils"
import {config} from "../config"
import { OrbiterData, SpatialObjectData } from '../data/SolarSystemData'

/** EllipticOrbit: orients periapsis along positive X axis
  */
export class EllipticOrbit extends AbstractOrbit{

  orbitalPeriod: Msec
  auSemiMajorAxis: Au
  semiMajorAxis: Au
  eccentricity: number
  meanAnomaly: Rad
  centerStandardGravitationalParameter: number 
  ellipse: Ellipse;
  data?: OrbiterData;

  lastAnimateTimestamp: number;
  currentPosOnOrbit: number;
  _initPosOnOrbit?: number;
  constructor(
    initDate: Date,
    msecOrbitalPeriod: Msec,
    auSemiMajorAxis: Au,
    eccentricity: number,
    radMeanAnomaly: Rad,
    centerStandardGravitationalParameter: number ,
    semiMajorAxisToOrbitRadius: ((x:number)=>number)=x=>x,
    data?: OrbiterData
  ){
    super(initDate, data)

    this.orbitalPeriod = msecOrbitalPeriod
    this.auSemiMajorAxis = auSemiMajorAxis
    this.semiMajorAxis = semiMajorAxisToOrbitRadius(this.auSemiMajorAxis)
    this.eccentricity = eccentricity
    this.meanAnomaly = radMeanAnomaly
    this.centerStandardGravitationalParameter = centerStandardGravitationalParameter 
    this.ellipse = new Ellipse(this.semiMajorAxis, this.eccentricity)

    this.lastAnimateTimestamp = 0
    this.currentPosOnOrbit = 0
    this._initPosOnOrbit = null
  }

  /** */
  initAnimation(newDate: Date=this.initDate){
    super.initAnimation(newDate)
    const state = this.computeStateAtDate(newDate)
    this.currentPosOnOrbit = state.posOnOrbit
    this.mobile.position.x = state.positionVector.x
    this.mobile.position.z = state.positionVector.z
    this.lastAnimateTimestamp = 0
    this.currentSimulTimestamp = +newDate
  }

  /** Finds the original 0-1 position on orbit from mean anomaly (no small feat) */
  initPosOnOrbit(relativeTolerance: number = 10000){
    if(this._initPosOnOrbit===null){
      const self = this
      const eccentricAnomaly = eccentricAnomalyNewtonsMethod(this.meanAnomaly, this.eccentricity)
      const x = this.semiMajorAxis * Math.cos(eccentricAnomaly) - this.ellipse.focus1.x
      const y = this.ellipse.semiMinorAxis * Math.sin(eccentricAnomaly)
      let f = l => self.ellipse.curve.getPointAt(l).x
      if(y>=0){
        this._initPosOnOrbit = binarySearch(f,0.5,0, x, self.ellipse.circumference/relativeTolerance)
      } else{
        this._initPosOnOrbit = binarySearch(f,0.5,1, x, self.ellipse.circumference/relativeTolerance)
      }
    }
    return this._initPosOnOrbit
  }

  /** */
  animate(msecSimulTimestamp: Msec){
  super.animate(msecSimulTimestamp)
    const msecSimulInterval = msecSimulTimestamp-this.lastAnimateTimestamp
    tconsole.debug("EO.animate() "+this.data?.name+" this.currentPosOnOrbit", this.currentPosOnOrbit, "this.mobile.position", this.mobile.position.clone())
    const state = this.computeState(msecSimulInterval, this.currentPosOnOrbit, this.mobile.position.clone())
    tconsole.debug("EO.animate2() "+this.data?.name+" state.posOnOrbit", state.posOnOrbit, "state.positionVector", state.positionVector.clone())
    this.currentPosOnOrbit = state.posOnOrbit
    this.mobile.position.x = state.positionVector.x
    this.mobile.position.z = state.positionVector.z
    this.lastAnimateTimestamp = msecSimulTimestamp
    this.currentSimulTimestamp += msecSimulInterval
    //tconsole.debug("EO.animate3() this.currentPosOnOrbit", this.currentPosOnOrbit, "this.mobile.position", this.mobile.position, "lastAnimateTimestamp", this.lastAnimateTimestamp, "this.currentSimulTimestamp", this.currentSimulTimestamp)
    }
 
  /** compute the state of the Orbit's mobile (position, orientation, etc...) from a position and time interval
  * 
  * Doesn't affect the state of the Elliptic Orbit (doesn't update this.mobile.position), call initAnimation()/animate() for that
  * @param {number} posOnOrbit between 0 and 1, position on orbit to compute from
  * @param {number} msecSimulInterval time interval (as msec) that for which orbit has to be computed
  * @param {THREE.Vector3} positionVector (optional) coordinates corresponding to posOnOrbit, avoids a call to getCoordinatesAt(posOnOrbit)
  */
  computeState(msecSimulInterval: Msec, posOnOrbit: number, positionVector: THREE.Vector3|null){
    //tconsole.debug("EO.computeState "+this.data?.name+" msecSimulInterval", msecSimulInterval, "posOnOrbit", posOnOrbit, "positionVector", positionVector)
    if(positionVector===null){
      positionVector = this.getCoordinatesAt(posOnOrbit)
    }
    console.debug("EO.computeState() "+this.data?.name+" INITIAL posOnOrbit", posOnOrbit, "positionVector", positionVector.clone())
    let intervalSign = Math.sign(msecSimulInterval)
    msecSimulInterval = Math.abs(msecSimulInterval) % this.orbitalPeriod
    let intervalComputed = 0
    
    // compute instant velocity & position at intervals for better precision
    while(intervalComputed<msecSimulInterval){
      const deltaT = Math.min(msecSimulInterval-intervalComputed, config.animateSimulationMsecMaxInterval)
      const instantVelocity = this.getInstantVelocity(posOnOrbit, positionVector)
      const portionOforbitEllapsed = intervalSign*deltaT*instantVelocity / this.ellipse.circumference
      posOnOrbit = mod(posOnOrbit+portionOforbitEllapsed, 1)
      intervalComputed += deltaT
      positionVector = this.getCoordinatesAt(posOnOrbit)
      console.debug("EO.computeState() "+this.data?.name+" COMPUTE posOnOrbit", posOnOrbit, "positionVector", positionVector.clone())
    }
    const tr = {posOnOrbit: posOnOrbit, positionVector: positionVector}
    tr.positionVector.y=0
    return tr
  }

  /** compute the state of the Orbit's mobile (position, orientation, etc...) from a date
  * 
  * Doesn't affect the state of the Elliptic Orbit (doesn't update this.mobile.position), call initAnimation()/animate() for that
  * @param {Date} date fixed date at which to compute state
  */
  computeStateAtDate(date: Date=this.initDate){
    //tconsole.debug("EO.computeStateAtDate() "+this.data?.name)
    // if date: compute from initial date&position
    const msecSimulInterval = (+date) - (+this.initDate)
    const initPosOnOrbit = this.initPosOnOrbit()
    return this.computeState(msecSimulInterval, initPosOnOrbit, null)
  }

  getCoordinatesAt(u: number): THREE.Vector3{
    const pos: THREE.Vector2 = this.ellipse.curve.getPointAt(u)
    const newPos = new THREE.Vector3()
    newPos.x = pos.x - this.ellipse.focus1.x
    newPos.z = -pos.y
    newPos.y = null
    //console.debug("EO.getCoordinatesAt() "+this.data?.name+" pos", pos, "newPos", newPos.clone())
    return newPos
  }
  getPath(segments: number=128, color: number= 0x222222){
    const points = this.ellipse.curve.getPoints(segments)
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({ color })
    const orbitEllipse = new THREE.Line( geometry, material );
    orbitEllipse.position.x -=  this.ellipse.focus1.x
    return orbitEllipse
  }

  /** Computes the instant velocity of a Keplerian Orbit according to the vis-viva equation
   * 
   * See https://en.wikipedia.org/wiki/Vis-viva_equation
   * unit: au/msec
   */
  getInstantVelocity(posOnOrbit: number|null, positionVector: THREE.Vector3|null): number{
    if(positionVector===null && posOnOrbit===null){
      positionVector = this.mobile.position
    }
    if(positionVector===null){
      positionVector = this.getCoordinatesAt(posOnOrbit)
    }
    const r = Math.sqrt(positionVector.x**2 + positionVector.z**2)
    const velocity = Math.sqrt(this.centerStandardGravitationalParameter*(2/r - 1/this.semiMajorAxis)) / sec
    //tconsole.log("EllOrbit.GETINSTANTVELOCITY() "+this.data?.name+": velocity", velocity, "r", r, "positionVector.x", positionVector.x, "positionVector.z", positionVector.z)
    return velocity
  }

  /** Computes the Instant Velocity Vector using the vis-viva equation
   * 
   * BROKEN: computes the direction of the vector as the perpendicular to the current positionVector.
   * 
   * Proper tangent computation: https://en.wikipedia.org/wiki/Ellipse#Tangent
   * 
   * unit: au/msec
   */
  getInstantVelocityVector(posOnOrbit: number|null, positionVector: THREE.Vector3|null): THREE.Vector3{
    if(positionVector===null && posOnOrbit===null){
      positionVector = this.mobile.position
    }
    if(positionVector===null){
      positionVector = this.getCoordinatesAt(posOnOrbit)
    }
    const pv = positionVector.clone()
    const velocity = this.getInstantVelocity(posOnOrbit, positionVector )
    const velVector = (new THREE.Vector3(0,1,0)).cross(new THREE.Vector3(positionVector.x,0,positionVector.z)).normalize().multiplyScalar(velocity)
    //tconsole.log("EllOrbit.getInstantVelocityVector(): pv", pv, "velocity", velocity, "velVector", velVector)
    return velVector
  }

  /** Creates EllipticOrbit from planet data
  * 
  * Expects o.orbitCenter.standardGravitationalParameter
  */
  static fromData(o: OrbiterData, orbitCenter: SpatialObjectData,
    semiMajorAxisToOrbitRadius:((x:number)=>number)=x=>x){
    return new EllipticOrbit(
      o.epoch,
      o.orbitalPeriod,
      o.semiMajorAxis,
      o.eccentricity,
      o.meanAnomaly,
      orbitCenter.standardGravitationalParameter,
      semiMajorAxisToOrbitRadius,
      o
    )
  }
 }
 
 
 