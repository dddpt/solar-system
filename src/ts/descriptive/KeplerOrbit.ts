import * as THREE from 'three'

import { CachedOrbit} from "./AbstractOrbit"
import {EllipticOrbit, EllipticOrbitState} from "./EllipticOrbit"
import { Au, Msec, Rad } from '../core/spatialUnits'
import { OrbiterData, SpatialObjectData } from '../data/SolarSystemData'
import { tconsole } from '../utils'
import { AbstractSpaceCache } from '../core/Cache'


export class KeplerOrbitCache extends AbstractSpaceCache<EllipticOrbitState>{
  keplerOrbit: KeplerOrbit;
  ellipticCache: AbstractSpaceCache<EllipticOrbitState>;
  constructor(keplerOrbit: KeplerOrbit, ellipticCache: AbstractSpaceCache<EllipticOrbitState>){
    super()
    this.keplerOrbit = keplerOrbit
    this.ellipticCache = ellipticCache
  }
  get(timestamp: number){
    const ellipticState = this.ellipticCache.get(timestamp)
    if(ellipticState){
      return this.keplerOrbit.tiltState(ellipticState)
    }
    return ellipticState
  }
  set(timestamp: number, ellipticState: EllipticOrbitState){
    this.ellipticCache.set(timestamp, this.keplerOrbit.untiltState(ellipticState))
  }
  getClosest(timestamp: number){
    const ellipticState = this.ellipticCache.getClosest(timestamp)
    return this.keplerOrbit.tiltState(ellipticState)
  }
}

/** KeplerOrbit
 * 
*/
export class KeplerOrbit extends CachedOrbit<EllipticOrbitState>{
  orbit: EllipticOrbit;
  longitudeOfAscendingNode: Rad;
  inclination: Rad;
  argumentOfPeriapsis: Rad;
  tiltedPlaneQuaternion: THREE.Quaternion;
  untiltQuaternion: THREE.Quaternion;
  data: OrbiterData;
  constructor(
    id: string,
    orbitCenterId: string,
    epoch: Date,
    msecOrbitalPeriod: Msec,
    auSemiMajorAxis: Au,
    eccentricity: number,
    radMeanAnomaly: Rad,
    centerStandardGravitationalParameter: number,
    radInclination: Rad,
    radLongitudeOfAscendingNode: Rad,
    radArgumentOfPeriapsis: Rad,
    semiMajorAxisToOrbitRadius:((x:number)=>number)=x=>x,
    data: OrbiterData,
    bufferSize: number=1000
  ){
    super(id, orbitCenterId, data, 0)
    this.orbit = new EllipticOrbit(id, orbitCenterId, epoch, msecOrbitalPeriod, auSemiMajorAxis, eccentricity, radMeanAnomaly, centerStandardGravitationalParameter , semiMajorAxisToOrbitRadius, this.data, bufferSize)
    this.cache = new KeplerOrbitCache(this, this.orbit.cache)
    
    this.longitudeOfAscendingNode = radLongitudeOfAscendingNode
    this.inclination = radInclination
    this.argumentOfPeriapsis = radArgumentOfPeriapsis

  }


  initialize(){
    tconsole.log("KO.initialize() "+ this.id)
    this.getTiltedOrbitalPlaneQuaternion()
    this.orbit.initialize()
  }
  
  getInitialState(): EllipticOrbitState {
    return this.tiltState(this.orbit.getInitialState())
  }

  getTiltedOrbitalPlaneQuaternion(): THREE.Quaternion{
    //tconsole.log("KO.getTiltedOrbitalPlaneQuaternion()" + this.id, "this.tiltedPlaneQuaternion", this.tiltedPlaneQuaternion)
    if(!this.tiltedPlaneQuaternion){

      /* Following how rotation is computed for THREE.Object3d:
      * https://github.com/mrdoob/three.js/blob/adc26e13beb1cfccc4c44f4de1f68e11f41e4510/src/core/Object3D.js#L506
      *  old rotation code form TiltedOrbitalPlane
      * this.object3d.rotateY(this.longitudeOfAscendingNode)
      * this.object3d.rotateX(this.inclination)
      * this.object3d.rotateY(this.argumentOfPeriapsis)
      */
      const quatLongitudeOfAscendingNode = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0,1,0),
        this.longitudeOfAscendingNode
      )
      const quatInclination = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(1,0,0),
        this.inclination
      )
      const quatArgumentOfPeriapsis = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0,1,0),
        this.argumentOfPeriapsis
      )
      this.tiltedPlaneQuaternion = quatLongitudeOfAscendingNode
        .multiply(quatInclination)
        .multiply(quatArgumentOfPeriapsis)
      this.untiltQuaternion = this.tiltedPlaneQuaternion.clone().conjugate()

      tconsole.log("  COMPUTED "+this.id+" this.tiltedPlaneQuaternion ", this.tiltedPlaneQuaternion)
    }
    return this.tiltedPlaneQuaternion
  }

  /** Tilt the given vector from the EllipticOrbit's plan to the Kepler Orbit's tilted plane
   * 
   * /!\ Tilts the vector in place, always clone vectors that must be immutable /!\
  */
  tiltVector(v: THREE.Vector3): THREE.Vector3{
    //tconsole.log("KO.tiltVector()"+this.id," v", v, " this.tiltedPlaneQuaternion", this.tiltedPlaneQuaternion)
    return v.applyQuaternion(this.tiltedPlaneQuaternion)
  }
  untiltVector(v: THREE.Vector3): THREE.Vector3{
    return v.applyQuaternion(this.untiltQuaternion)
  }

  /** Tilts the state from the EllipticOrbit's plane to the Kepler Orbit's tilted plane */
  tiltState(state: EllipticOrbitState): EllipticOrbitState{
    return new EllipticOrbitState(
      state.timestamp,
      this.tiltVector(state.position.clone()),
      this.tiltVector(state.velocity.clone()),
      state.rotation,
      state.posOnOrbit
    )
  }

  /** Tilts back a state from the Kepler Orbit's tilted plane to the EllipticOrbit's plane */
  untiltState(state: EllipticOrbitState): EllipticOrbitState{
    return new EllipticOrbitState(
      state.timestamp,
      this.untiltVector(state.position.clone()),
      this.untiltVector(state.velocity.clone()),
      state.rotation,
      state.posOnOrbit
    )
  }

  /** See EllipticOrbit.computeState
   * 
 * Only applies the Kepler orbit's plane's rotations to the vector from EllipticOrbit.computeState
   */
  computeState(timestamp: Msec){
    const state = this.orbit.computeState(timestamp)
    //console.debug("KO.computeState tr.posOnOrbit", tr.posOnOrbit, "tr.positionVector", tr.positionVector)
    return this.tiltState(state)
  }

  /** compute the state of the Orbit's mobile (position, orientation, etc...) from a date
   * 
   * @param {Date} date fixed date at which to compute state
   */
  computeStateAtDate(date: Date){
    const state = this.orbit.computeStateAtDate(date)
    return this.tiltState(state)
  }

  /**au/msec */
  getInstantVelocity(posOnOrbit: number|null, positionVector: THREE.Vector3|null){
    return this.orbit.getInstantVelocity(posOnOrbit, positionVector)
  }

  /**au/msec */
  getInstantVelocityVector(posOnOrbit: number|null, positionVector: THREE.Vector3|null){
    return this.tiltVector(this.orbit.getInstantVelocityVector(posOnOrbit, positionVector))
  }

  /** Creates KeplerOrbit from planet data
   * 
   * Expects o.orbitCenter.standardGravitationalParameter
   */
  static fromData(o: OrbiterData,
    orbitCenter: SpatialObjectData,
    semiMajorAxisToOrbitRadius:((x:number)=>number)=x=>x
  ){
    return new KeplerOrbit(
      o.id,
      o.orbitCenterId,
      o.epoch,
      o.orbitalPeriod,
      o.semiMajorAxis,
      o.eccentricity,
      o.meanAnomaly,
      orbitCenter.standardGravitationalParameter,
      o.inclination,
      o.longitudeOfAscendingNode,
      o.argumentOfPeriapsis,
      semiMajorAxisToOrbitRadius,
      o
    )//, logSemiMajorAxis)
  }
}