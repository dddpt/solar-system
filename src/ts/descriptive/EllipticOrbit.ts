import * as THREE from 'three'

import {AbstractOrbit, CachedOrbit} from "./AbstractOrbit"
import {msec, sec, d,w, month, yr, Msec, Au, Rad, time} from "../core/spatialUnits"
import {mod, eccentricAnomalyNewtonsMethod, binarySearch, Ellipse, tconsole} from "../utils"
import {config} from "../config"
import { OrbiterData, SpatialObjectData } from '../data/SolarSystemData'
import { SpatialObjectState } from '../core/SpaceObject'

export class EllipticOrbitState extends SpatialObjectState{
  posOnOrbit: number; // between 0 and 1
  constructor(
      timestamp: number,
      position: THREE.Vector3,
      velocity: THREE.Vector3,
      rotation: THREE.Quaternion,
      posOnOrbit: number
    ){
      super(timestamp, position, velocity, rotation)
      this.posOnOrbit = posOnOrbit
    }
    applyChildState(childState: SpatialObjectState): SpatialObjectState{
      const sos = super.applyChildState(childState)
      //@ts-ignore
      if(!childState.posOnOrbit){
        return sos
      }
      return new EllipticOrbitState(
      //@ts-ignore
        sos.timestamp, sos.position, sos.velocity, sos.rotation, childState.posOnOrbit
      )
    }
    applyParentState(parentState: SpatialObjectState): SpatialObjectState{
      const sos = super.applyParentState(parentState)
      return new EllipticOrbitState(
        sos.timestamp, sos.position, sos.velocity, sos.rotation, this.posOnOrbit
      )
    }

  
}

/** EllipticOrbit: orients periapsis along positive X axis
  */
export class EllipticOrbit extends CachedOrbit<EllipticOrbitState>{

  orbitalPeriod: Msec
  auSemiMajorAxis: Au
  semiMajorAxis: Au
  eccentricity: number
  meanAnomaly: Rad
  centerStandardGravitationalParameter: number 
  ellipse: Ellipse;
  initialTimestamp: number;
  _initialState: EllipticOrbitState;
  data: OrbiterData;
  lastAnimateTimestamp: number;
  currentPosOnOrbit: number;

  constructor(
    id: string,
    orbitCenterId: string,
    initDate: Date,
    msecOrbitalPeriod: Msec,
    auSemiMajorAxis: Au,
    eccentricity: number,
    radMeanAnomaly: Rad,
    centerStandardGravitationalParameter: number ,
    semiMajorAxisToOrbitRadius: ((x:number)=>number)=x=>x,
    data?: OrbiterData,
    bufferSize: number=1000
  ){
    super(id, orbitCenterId, data, bufferSize)

    this.initialTimestamp = +initDate;
    this.orbitalPeriod = msecOrbitalPeriod
    this.auSemiMajorAxis = auSemiMajorAxis
    this.semiMajorAxis = semiMajorAxisToOrbitRadius(this.auSemiMajorAxis)
    this.eccentricity = eccentricity
    this.meanAnomaly = radMeanAnomaly
    this.centerStandardGravitationalParameter = centerStandardGravitationalParameter 
    this.ellipse = new Ellipse(this.semiMajorAxis, this.eccentricity)

    this.lastAnimateTimestamp = 0
    this.currentPosOnOrbit = 0
  }

  initialize(){
    this.getInitialState()
  }

  getInitialState(): EllipticOrbitState {
    if(!this._initialState){
      const initPosOnOrbit = this.initialPosOnOrbit()
      const position = this.getCoordinatesAt(initPosOnOrbit)
      this._initialState = new EllipticOrbitState(
        this.initialTimestamp,
        position,
        this.getInstantVelocityVector(initPosOnOrbit, position),
        (new THREE.Quaternion()).setFromAxisAngle(new THREE.Vector3(0,1,0), 0),
        initPosOnOrbit
      )
      this.cache.set(this.initialTimestamp, this._initialState)
    }
    return this._initialState
  }

  /** Finds the original 0-1 position on orbit from mean anomaly (no small feat) */
  initialPosOnOrbit(relativeTolerance: number = 10000){
    const self = this
    const eccentricAnomaly = eccentricAnomalyNewtonsMethod(this.meanAnomaly, this.eccentricity)
    const x = this.semiMajorAxis * Math.cos(eccentricAnomaly) - this.ellipse.focus1.x
    const y = this.ellipse.semiMinorAxis * Math.sin(eccentricAnomaly)
    let f = (l: number) => self.ellipse.curve.getPointAt(l).x
    if(y>=0){
      return binarySearch(f,0.5,0, x, self.ellipse.circumference/relativeTolerance)
    } else{
      return binarySearch(f,0.5,1, x, self.ellipse.circumference/relativeTolerance)
    }
  }
 
  /** compute the state of the Orbit's mobile (position, orientation, etc...) from a position and time interval
  * 
  * Doesn't affect the state of the Elliptic Orbit (doesn't update this.mobile.position), call initAnimation()/animate() for that
  * @param {number} posOnOrbit between 0 and 1, position on orbit to compute from
  * @param {number} msecSimulInterval time interval (as msec) that for which orbit has to be computed
  * @param {THREE.Vector3} positionVector (optional) coordinates corresponding to posOnOrbit, avoids a call to getCoordinatesAt(posOnOrbit)
  */
  //25.12.19 old signature:
  //mputeState(msecSimulInterval: Msec, posOnOrbit: number, positionVector: THREE.Vector3|null){
  computeState(timestamp: Msec){
    const closestState = this.cache.getClosest(timestamp)
    let msecSimulInterval= timestamp - closestState.timestamp
    let posOnOrbit = closestState.posOnOrbit
    let positionVector = closestState.position.clone()
    //tconsole.debug("EO.computeState() "+this.data?.id+" INITIAL posOnOrbit", posOnOrbit, "positionVector", positionVector.clone())
    
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
      //tconsole.debug("EO.computeState() "+this.data?.id+" COMPUTE posOnOrbit", posOnOrbit, "positionVector", positionVector.clone())
    }
    positionVector.y=0
    const tr = new EllipticOrbitState(
      timestamp,
      positionVector,
      this.getInstantVelocityVector(posOnOrbit, positionVector),
       // TODO: compute rotation
      closestState.rotation.clone(),
      posOnOrbit
    )
    if(this.id=="Earth"){
      //tconsole.log("EO.cs() "+this.id, "position", positionVector.clone(), "velocity", tr.velocity.clone(), "velocityNB", tr.velocity.length())
      //tconsole.log("ELLO.cs() "+this.id, " velocityNB", tr.velocity.length(), " deltaT", intervalComputed)
    }
    return tr
  }

  getCoordinatesAt(u: number): THREE.Vector3{
    const pos: THREE.Vector2 = this.ellipse.curve.getPointAt(u)
    const newPos = new THREE.Vector3()
    newPos.x = pos.x - this.ellipse.focus1.x
    newPos.z = -pos.y
    newPos.y = null
    //console.debug("EO.getCoordinatesAt() "+this.data?.id+" pos", pos, "newPos", newPos.clone())
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
      throw "EllipticOrbit.getInstantVelocity() posOnOrbit or positionVector must not be null"
    }
    if(positionVector===null){
      positionVector = this.getCoordinatesAt(posOnOrbit)
    }
    const r = Math.sqrt(positionVector.x**2 + positionVector.z**2)
    const velocity = Math.sqrt(this.centerStandardGravitationalParameter*(2/r - 1/this.semiMajorAxis)) / sec
    //tconsole.log("EllOrbit.GETINSTANTVELOCITY() "+this.data?.id+": velocity", velocity, "r", r, "positionVector.x", positionVector.x, "positionVector.z", positionVector.z)
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
      throw "EllipticOrbit.getInstantVelocityVector() posOnOrbit or positionVector must not be null"
    }
    if(positionVector===null){
      positionVector = this.getCoordinatesAt(posOnOrbit)
    }

    // tangent computation following vector parametric equation of the tangent
    const a = this.ellipse.semiMajorAxis
    const b = this.ellipse.semiMinorAxis
    const tangentVector = new THREE.Vector3(
      positionVector.z*(a**2),
      0,
      -positionVector.x*(b**2),
    )
    tangentVector.normalize()

    const velocity = this.getInstantVelocity(posOnOrbit, positionVector)
    return tangentVector.multiplyScalar(velocity)
  }

  /** Creates EllipticOrbit from planet data
  * 
  * Expects o.orbitCenter.standardGravitationalParameter
  */
  static fromData(o: OrbiterData, orbitCenter: SpatialObjectData,
    semiMajorAxisToOrbitRadius:((x:number)=>number)=x=>x){
    return new EllipticOrbit(
      o.id,
      o.orbitCenterId,
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
 
 
 