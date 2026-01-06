import { SpatialObjectState } from "./SpaceObject";

/** Class to store a cache of computed spatial objects position
 * 
 * TODO: implementation using Map totally suboptimal, to be done with BinarySearchTree
 */
export abstract class AbstractSpaceCache<T extends SpatialObjectState>{
  abstract get(timestamp: number): T;
  abstract set(timestamp: number, value: T): void;
  abstract getClosest(timestamp:number): T;
}

/** Class to store a cache of computed spatial objects position
 * 
 * TODO: implementation using Map totally suboptimal, to be done with BinarySearchTree
 */
export class SpaceCache<T extends SpatialObjectState> extends AbstractSpaceCache<T>{
  map: Map<number, T>;
  bufferSize: number;
  constructor(bufferSize=1000){
    super()
    this.map = new Map<number, T>()
    this.bufferSize=bufferSize
  }
  get(timestamp: number){
    return this.map.get(timestamp)
  }
  set(timestamp: number, value: T): void{
    this.map.set(timestamp, value)
  }
  /** TODO: wholly suboptimal reimplement using BinarySearchTree */
  getClosest(timestamp:number){
    let closestDiff:number = timestamp
    let closest: T = null
    this.map.forEach((state, ts)=>{
      const diff = Math.abs(timestamp-ts)
      if(diff<closestDiff){
        closestDiff=diff
        closest=state
      }
    })
    return closest
  }
}