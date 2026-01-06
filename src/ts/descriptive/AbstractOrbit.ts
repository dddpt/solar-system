import * as THREE from 'three'

import { SpaceObject, SpatialObjectState } from '../core/SpaceObject'
import { Msec } from '../core/spatialUnits'
import { OrbiterData, SpatialObjectData } from '../data/SolarSystemData'
import { AbstractSpaceCache, SpaceCache } from '../core/Cache'

export abstract class AbstractOrbit<OrbitState extends SpatialObjectState> extends SpaceObject<OrbitState>{
  orbitCenterId: string
  constructor(id: string, orbitCenterId: string, data?: any){
    super()
    this.id = id
    this.orbitCenterId = orbitCenterId
    this.data = data
    
  }

  
  abstract initialize(): void;
  abstract getState(timestamp: Msec): OrbitState;

  // 2025.12.19 old signature:
  //stract computeState(msecSimulInterval: Msec, posOnOrbit: number, positionVector: THREE.Vector3|null): {posOnOrbit: number, positionVector: THREE.Vector3};
  abstract computeState(timestamp: Msec): OrbitState;
  
  /** compute the state of the Orbit's mobile (position, orientation, etc...) from a date
  * 
  * Doesn't affect the state of the Elliptic Orbit (doesn't update this.mobile.position), call initAnimation()/animate() for that
  * @param {Date} date fixed date at which to compute state
  */
  // 2025.12.19 old signature:
  //mputeStateAtDate(date: Date): {posOnOrbit: number, positionVector: THREE.Vector3};
  computeStateAtDate(date: Date): OrbitState{
    return this.computeState(+date)
  }

  /**ABSTRACT static method */
  static fromData(o: OrbiterData, orbitCenter: SpatialObjectData){
    throw "AbstractOrbit.fromData(): abstract method called"
  }
}


export abstract class CachedOrbit<OrbitState extends SpatialObjectState> extends AbstractOrbit<OrbitState>{
  cache: AbstractSpaceCache<OrbitState>
  constructor(id: string, orbitCenterId: string, data?: any, bufferSize: number=1000){
    super(id, orbitCenterId, data)
    if(bufferSize){
      this.cache = new SpaceCache<OrbitState>(bufferSize)
    }
  }
  getState(timestamp: Msec): OrbitState{
    const directMatch = this.cache.get(timestamp)
    if(directMatch!==undefined){
      return directMatch
    }
    else{
      const result = this.computeState(timestamp)
      this.cache.set(timestamp, result)
      return result
    }
  }
}
