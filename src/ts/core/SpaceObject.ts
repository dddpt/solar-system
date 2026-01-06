import * as THREE from 'three'
import { Msec } from './spatialUnits'
import { OrbiterData, SpatialObjectData } from '../data/SolarSystemData';


/** Any kind of SpaceObject
 */
export abstract class SpaceObject<State extends SpatialObjectState>{
  id: string;
  data: any
  constructor(){}

    abstract initialize(): void;
    abstract getInitialState(): State;
    abstract getState(timestamp: Msec): State;

    // 2025.12.19 old signature:
    //stract computeState(msecSimulInterval: Msec, posOnOrbit: number, positionVector: THREE.Vector3|null): {posOnOrbit: number, positionVector: THREE.Vector3};
    abstract computeState(timestamp: Msec): State;
    
    /** compute the state of the Orbit's mobile (position, orientation, etc...) from a date
    * 
    * Doesn't affect the state of the Elliptic Orbit (doesn't update this.mobile.position), call initAnimation()/animate() for that
    * @param {Date} date fixed date at which to compute state
    */
    // 2025.12.19 old signature:
    //mputeStateAtDate(date: Date): {posOnOrbit: number, positionVector: THREE.Vector3};
    computeStateAtDate(date: Date): State{
      return this.computeState(+date)
    }
  
    /**ABSTRACT static method */
    static fromData(o: OrbiterData, orbitCenter: SpatialObjectData){
      throw "AbstractOrbit.fromData(): abstract method called"
    }
}


export class SpatialObjectState{
  timestamp: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Quaternion;
  constructor(
    timestamp: number,
    position: THREE.Vector3,
    velocity: THREE.Vector3,
    rotation: THREE.Quaternion
  ){
    this.timestamp = timestamp
    this.position = position
    this.velocity = velocity
    this.rotation = rotation
  }

  /** Returns new SpatialObjectState applying this state's position and rotation to child's state*/
  applyChildState(childState: SpatialObjectState): SpatialObjectState{
    if(childState.timestamp!=this.timestamp){
      console.warn("SpatialObjectState.computeChildState(): combining 2 states with different timestamps. this.timestamp: " +(new Date(this.timestamp)), " child timestamp: "+(new Date(childState.timestamp)))
    }

    return new SpatialObjectState(
      this.timestamp,
      childState.position.clone().applyQuaternion(this.rotation).add(this.position),
      childState.velocity.clone().applyQuaternion(this.rotation).add(this.velocity),
      this.rotation.clone().multiply(childState.rotation)
    )
  }
  /** Returns new SpatialObjectState with parent's position and rotation applied*/
  applyParentState(parentState: SpatialObjectState): SpatialObjectState{
    return parentState.applyChildState(this)
  }
}