
import * as THREE from 'three'

import { KeplerOrbit } from '../descriptive/KeplerOrbit'
import { Au, Kg, Msec, time } from '../core/spatialUnits';
import { OrbiterData, SpatialObjectData } from '../data/SolarSystemData';
import { tconsole } from '../utils';
import { SpaceObject, SpatialObjectState } from '../core/SpaceObject';
import { AbstractSpaceCache, SpaceCache } from '../core/Cache';

export class NewtonianState extends SpatialObjectState{
  acceleration: THREE.Vector3;
  force: THREE.Vector3;

  constructor(
      timestamp: number,
      position: THREE.Vector3,
      velocity: THREE.Vector3,
      rotation: THREE.Quaternion,
      acceleration: THREE.Vector3,
      force: THREE.Vector3,
    ){
      super(timestamp, position, velocity, rotation)
      this.acceleration=acceleration
      this.force=force
    }
    clone(){
      return new NewtonianState(
        this.timestamp,
        this.position.clone(),
        this.velocity.clone(),
        this.rotation.clone(),
        this.acceleration?.clone(),
        this.force?.clone()
      )
    }
}

export class NewtonianBody extends SpaceObject<NewtonianState>{
  mass: Kg;
  initialState: NewtonianState
  cache: AbstractSpaceCache<NewtonianState>

  /** NewtonianBody: represents an object affected by gravity
   * 
   * @param {number} kgMass 
   * @param {THREE.Vector3} auPosition
   * @param {THREE.Vector3} auPerMsecSpeed
   * @param {THREE.Vector3} auPerMsec2Acceleration defaults to (0,0,0)
   */
  constructor(
    id: string,
    kgMass: Kg,
    initialState: NewtonianState,
    data: any
  ){
    super()
    this.id = id
    this.mass = kgMass
    this.initialState=initialState
    this.data=data
    this.cache = new SpaceCache<NewtonianState>(1000)
    this.cache.set(initialState.timestamp, initialState)
  }

  initialize(): void {}

  getInitialState(): NewtonianState {
    return this.initialState
  }

  // TODO handle cache misses
  getState(timestamp: Msec): NewtonianState {
    const state = this.cache.get(timestamp)
    if(!state){
      throw "NewtonianBody.getState() state for timestamp "+timestamp+" not found."
    }
    return state
  }

  // TODO handle cache misses
  getClosestState(timestamp: Msec): NewtonianState {
    return this.cache.getClosest(timestamp)
  }

  computeState(timestamp: Msec): NewtonianState {
    throw "NewtonianBody.computeState() computeState() implemented at GravitationalSystem level, not NewtonianBody."
  }

  clone(){
    return new NewtonianBody(this.id, this.mass, this.initialState.clone(), this.data)
  }

  static fromData(o: SpatialObjectData,
    orbitCenter: SpatialObjectData|undefined,
    semiMajorAxisToOrbitRadius:((x:number)=>number)=x=>x
  ){
    console.log("NewtonianBody.fromData() o", o, " orbitCenter", orbitCenter)
    let initialState: NewtonianState;
    if(orbitCenter){
      const keplerOrbit = KeplerOrbit.fromData(o as OrbiterData, orbitCenter, semiMajorAxisToOrbitRadius)
      keplerOrbit.initialize()
      const koInitialState = keplerOrbit.getInitialState()
      initialState = new NewtonianState(
        koInitialState.timestamp,
        koInitialState.position,
        koInitialState.velocity,
        koInitialState.rotation,
        null,
        null,
      )
    }else{
      initialState = new NewtonianState(
        +o.epoch,
        new THREE.Vector3(0,0,0),
        new THREE.Vector3(0,0,0),
        new THREE.Quaternion(0,0,0,0),
        null,
        null,
      )
    }
    return new NewtonianBody(o.id, o.mass, initialState, o)
  }
}