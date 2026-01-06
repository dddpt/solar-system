import * as THREE from 'three'

import { SpaceObject, SpatialObjectState } from "../core/SpaceObject";
import { OrbiterData, SpatialObjectData } from '../data/SolarSystemData';
import { AbstractOrbit } from './AbstractOrbit';
import { tconsole } from '../utils';
import { OrbitalSystem, orderBodies } from '../core/OrbitalSystem';



export class DescriptiveOrbitalSystem<OrbiterState extends SpatialObjectState, Orbit extends AbstractOrbit<OrbiterState>> extends OrbitalSystem<OrbiterState, Orbit>{
  nonOrbitingBodies: Map<string, SpatialObjectData>;

  constructor(
    orbitingBodies: Orbit[],
    nonOrbitingBodies: SpatialObjectData[]
  ){
    super(orbitingBodies)
    this.nonOrbitingBodies = new Map<string, SpatialObjectData>();
    nonOrbitingBodies.forEach(bodyData=>{
      this.nonOrbitingBodies.set(bodyData.id, bodyData)
    })
  }

  getOtherBodiesData(): SpatialObjectData[]{
    return Array.from(this.nonOrbitingBodies.values())
  }
  /** Returns the parent of the given orbiter from closest to furthest orbit Center
   * 
   * i.e. `getParents(moon)` should return [earthOrbit, sunOrbit]
   */
  getParentsFromId(orbitId:string): Orbit[]{
    const body = this.bodies.get(orbitId)
    return this.getParents(body)
  }
  getParents(orbit:Orbit, parentsAccumulator: Orbit[]=[]): Orbit[]{
    const parent = this.bodies.get(orbit.orbitCenterId)
    if(!parent){
      const finalParent = this.nonOrbitingBodies.get(orbit.orbitCenterId)
      if(!finalParent){
        throw "DescriptiveOrbitalSystem.getParents(): parent of "+orbit.id+" with id "+orbit.orbitCenterId+" not found."
      }
      return parentsAccumulator
    }
    parentsAccumulator.push(parent)
    return this.getParents(parent, parentsAccumulator)
    
  }

  /** Returns Orbits' local state respective to their own orbit center */
  getLocalStates(timestamp: number): Map<string, OrbiterState>{
    const states = new Map<string, OrbiterState>()
    for(let [orbitId,body] of this.bodies.entries()){
      states.set(orbitId, body.getState(timestamp))
    }
    return states
  }

  /** Returns Orbits' local state respective to their own orbit center */
  getLocalState(timestamp: number, orbitId: string): OrbiterState{
    const body = this.bodies.get(orbitId)
    return body.getState(timestamp)
  }
  
  /** Returns Orbit's state relative to global center */
  getState(timestamp: number, orbitId: string): OrbiterState{
    const orbit = this.getBody(orbitId)
    const parents: Orbit[] = this.getParents(orbit)
    let globalState: OrbiterState = orbit.getState(timestamp)
    for(let parentOrbit of parents){
      const parentState = parentOrbit.getState(timestamp)
      globalState = parentState.applyParentState(globalState) as OrbiterState
    }
    return globalState
  }

  /*static fromData<OrbiterState2 extends SpatialObjectState, Stateful2 extends AbstractOrbit<OrbiterState2>>(
    bodiesData: (SpatialObjectData | OrbiterData)[],
    fromData: (data: OrbiterData | SpatialObjectData, centerData: SpatialObjectData, ...args: any[]) => Stateful2, ...args: any[]
  ): DescriptiveOrbitalSystem<OrbiterState2, Stateful2> {

    const bodiesDataOrdered = orderBodies(bodiesData)

    const bodies: [id: string, body: Stateful2][] = bodiesDataOrdered.filter(bd=>bd.orbitCenterId).map(bodyData=>[
      bodyData.id,
      fromData(
        bodyData,
        bodiesDataOrdered.find(b=>b.id==bodyData.orbitCenterId),
        ...args
      )
    ])
    const nonOrbitingBodies: SpatialObjectData[] = bodiesDataOrdered.filter(bd=>!bd.orbitCenterId)
    return new DescriptiveOrbitalSystem(bodies, nonOrbitingBodies)
  }*/
}
