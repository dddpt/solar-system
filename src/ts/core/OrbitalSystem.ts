import * as THREE from 'three'

import { SpaceObject, SpatialObjectState } from "./SpaceObject";
import { OrbiterData, SpatialObjectData } from '../data/SolarSystemData';
import { AbstractOrbit } from '../descriptive/AbstractOrbit';
import { tconsole } from '../utils';
import { Msec } from './spatialUnits';

export abstract class OrbitalSystem<OrbiterState extends SpatialObjectState, Stateful extends SpaceObject<OrbiterState>>{
  bodies: Map<string, Stateful>;

  constructor(
    bodies: Stateful[]
  ){
    this.bodies= new Map<string, Stateful>()
    bodies.forEach(body=>{
      this.bodies.set(body.id, body)
    })
  }

  initialize(){
    for(let body of this.bodies.values()){
      body.initialize()
    }
  }

  add(bodyId: string, body: Stateful){
    this.bodies.set(bodyId, body)
  }

  /** Ensure orbits are added to the OrbitalSystem with "central" orbiters first */
  _orderedAddBody(
    bodyData: OrbiterData|SpatialObjectData,
    bodiesData: (SpatialObjectData|OrbiterData)[],
    fromData: (data: OrbiterData, centerData: SpatialObjectData, ...args: any[])=>Stateful,
    ...args: any[]
  ){
    // TOTHINK get rid of this next if()?
    if(bodyData.orbitCenterId){
      const orbitingBodyData = bodyData as OrbiterData
      let centerData: SpatialObjectData|OrbiterData = bodiesData.find(x=>x.id==bodyData.orbitCenterId)
      if((!this.bodies.has(centerData.orbitCenterId))){
        this._orderedAddBody(centerData, bodiesData, fromData, args)
      }
      this.bodies.set(bodyData.id, fromData(orbitingBodyData, centerData, args))
    }
  }

  getBody(orbitId: string): Stateful{
    return this.bodies.get(orbitId)
  }

  /** */
  getOtherBodiesData(): SpatialObjectData[]{
    return []
  }
  
  /** Returns Orbits' states relative to global center */
  getStates(timestamp: number): Map<string, OrbiterState>{
    const globalStates = new Map<string, OrbiterState>()
    for(let orbitId in  this.bodies){
      globalStates.set(orbitId, this.getState(timestamp, orbitId))
    }
    return globalStates
  }
  
  /** Returns Orbit's state relative to global center */
  abstract getState(timestamp: number, orbitId: string): OrbiterState;

  /*abstract static fromData<OrbiterState2 extends SpatialObjectState, Stateful2 extends SpaceObject<OrbiterState2>>(
    bodiesData: (SpatialObjectData|OrbiterData)[],
    fromData: (data: OrbiterData|SpatialObjectData, centerData: SpatialObjectData, ...args: any[])=> Stateful2,
    ...args: any[]
  ): OrbitalSystem<OrbiterState2, Stateful2>{
    const bodiesDataOrdered = orderBodies(bodiesData)
    const bodies = bodiesDataOrdered.map(bodyData=>{
      const centerData = bodiesData.find(x=>x.id==bodyData.orbitCenterId)
      return [bodyData.id, fromData(bodyData, centerData, args)]
    })
    return null//new OrbitalSystem(bodies)
  }*/

  
getStatesFromTo(
    orbitId: string,
    fromTimestamp: number,
    toTimestamp: number,
    nbSteps?: number,
    stepInterval?: Msec,
  ): OrbiterState[]{
    if((!nbSteps) && (!stepInterval)){
      throw "OrbitalSystem.regularSteps() nbSteps and stepInterval undefined. Needs at least 1"
    }

    const totalInterval = toTimestamp-fromTimestamp

    if(!stepInterval){
      stepInterval = totalInterval / (nbSteps-1)
    }
    const states: OrbiterState[] = []
    let timestamp = fromTimestamp
    while(timestamp<=toTimestamp){
      states.push(this.getState(timestamp, orbitId))
      timestamp = timestamp+stepInterval
    }
    return states
  }


  getFullOrbitStates(
    orbitId: string,
    nbSteps?: number,
    stepInterval?: Msec,
  ): OrbiterState[]{
    const orbit = this.getBody(orbitId)
    const fromTimestamp = orbit.getInitialState().timestamp
    const toTimestamp = fromTimestamp + orbit.data.orbitalPeriod
    const states: OrbiterState[] = this.getStatesFromTo(orbit.data.id, fromTimestamp, toTimestamp, nbSteps, stepInterval)

    return states
  }
}

export function orderBodies(
  bodiesData: (SpatialObjectData|OrbiterData)[],
){

  const accumulator = []
  bodiesData.forEach(bd => _orderBodiesRec(bodiesData, bd, accumulator))
  return accumulator
}

function _orderBodiesRec(
  bodiesData: (SpatialObjectData|OrbiterData)[],
  bodyData?: OrbiterData|SpatialObjectData,
  accumulator?: (SpatialObjectData|OrbiterData)[]
){
  if(!accumulator.find(b=>b===bodyData)){
    // TOTHINK get rid of this next if()?
    if(!bodyData.orbitCenterId){
        accumulator.push(bodyData)
    }else{
      const orbitingBodyData = bodyData as OrbiterData
      let centerData: SpatialObjectData|OrbiterData = bodiesData.find(x=>x.id==bodyData.orbitCenterId)
      _orderBodiesRec(bodiesData, centerData, accumulator)
      accumulator.push(bodyData)
    }
  }
  return accumulator
}