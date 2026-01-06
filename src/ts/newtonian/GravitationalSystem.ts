
import * as THREE from 'three'

import {gravitationalConstant, Msec} from "../core/spatialUnits"
import {config} from "../config"
import { tconsole } from '../utils'
import { NewtonianBody, NewtonianState } from './NewtonianBody'
import { OrbitalSystem, orderBodies } from '../core/OrbitalSystem'
import { OrbiterData, SpatialObjectData } from '../data/SolarSystemData'



export class GravitationalSystem extends OrbitalSystem<NewtonianState, NewtonianBody>{
  currentTimestamp: number;
  /** Bodies should be a list of NewtonianBody */
  constructor(bodies: NewtonianBody[]){
    super(bodies)
  }

  getState(timestamp: number, orbitId: string): NewtonianState {
    const body = this.bodies.get(orbitId)
    let state = body.cache.get(timestamp)
    if(!state){
      this.computeState(timestamp)
      return body.getState(timestamp)
    }
    return state
  }

  /** TODO: Computes instant Force & acceleration for all bodies given their current relative positions&masses*
  computeForceAcceleration(inPlace=true){}
  /** TODO: Adds Acceleration to the speed *
  computeSpeed(msecSimulInterval: Msec, inPlace=true){}
  /** TODO: Adds speed to the position
   * 
   * TODO: have acceleration & speed next order derivations 
   */
  computePosition(msecSimulInterval: Msec, inPlace=true){}
  
  /** compute the state of the GravitationalSystem after the given time interval
  * 
  * For each body, goes as follows:
  * - the speed of each body is added to the position
  * - the force&acceleration for each body is computed
  * - ...and added to its speed
  * 
  */
  //old signature 25.12.23
  //computeState(msecSimulInterval: Msec, inPlace: boolean=true): NewtonianBody[]{
  computeState(timestamp:Msec): Map<string, NewtonianState>{
    //tconsole.log("GS.computeState() timestamp", timestamp)
    const bodies: NewtonianBody[] = Array.from(this.bodies.values())

    const closestState = bodies[0].getClosestState(timestamp).clone()    
    const closestTimestamp = closestState.timestamp
    const msecInterval = timestamp - closestTimestamp

    //console.log("COMPUTE STATE msecSimulInterval: ", msecSimulInterval, ", msecSimulInterval as days:", msecSimulInterval/d, ", as hours: ",  msecSimulInterval/h)
    const newStates = new Map<string, NewtonianState>()
    bodies.forEach(body=>{
      newStates.set(body.id, body.getState(closestTimestamp).clone())
    })

    // compute instant force & acceleration at intervals for better precision
    let intervalComputed = 0
    while(intervalComputed<msecInterval){
      const deltaT = Math.min(msecInterval-intervalComputed, config.animateSimulationMsecMaxInterval)
      //console.log("  + msecSimulInterval-intervalComputed: ", msecSimulInterval-intervalComputed, ", config.simMsecMaxInterval: ",config.animateSimulationMsecMaxInterval, "deltaT: ", deltaT, ", deltaT as days:", deltaT/d, ", as hours: ",  deltaT/h)
      // update positions
      newStates.forEach(s=>{
        s.position.add(s.velocity.clone().multiplyScalar(msecInterval))
        s.force = new THREE.Vector3()
      })
      // update force
     //tconsole.log("COMPUTE STATE")
      for(let i=0; i<bodies.length; i++){
        const b1 = bodies[i]
        const b1State = newStates.get(b1.id)
        for(let j=i+1; j<bodies.length; j++){
          const b2 = bodies[j]
          const b2State = newStates.get(b2.id)
          //tconsole.log("- start b1.position", b1.position, "b2.position")
          const dist = b1State.position.distanceTo(b2State.position)
          
          const forceNb = gravitationalConstant * b1.mass * b2.mass / dist
          const force = b1State.position.clone().sub(b2State.position).normalize().multiplyScalar(forceNb)
          b2State.force.add(force)
          b1State.force.add(force.negate())
          //tconsole.log("- b1.position", b1.position, "b2.position", b2.position, "dist", dist, "forceNb", forceNb, "b2.force", b2.force, "b1.force", b1.force)
        }
        b1State.acceleration = b1State.force.divideScalar(b1.mass)
        b1State.velocity.add(b1State.acceleration.clone().multiplyScalar(msecInterval))
        //tconsole.log("    - pos: ",b1.position.clone(), ", spd: ",b1.speed.clone(), ", acc: ",b1.acceleration.clone(), ", force: ",b1.force.clone())
      }
      //update intervalComputed
      intervalComputed += deltaT
    }
    for(let [bodyId, newState] of newStates){
      this.bodies.get(bodyId).cache.set(timestamp, newState)
    }
    return newStates
  }

  static fromData(
    bodiesData: (SpatialObjectData | OrbiterData)[],
    ...args: any[]
  ): GravitationalSystem {
    const gs = GravitationalSystem.fromKeplerOrbitData(bodiesData, ...args)
    console.log("GS.fromData() gs: ", gs)
    return gs
  }

  static fromKeplerOrbitData(
    bodiesData: (SpatialObjectData | OrbiterData)[],
    ...args: any[]
  ): GravitationalSystem {
  
    const bodiesDataOrdered = orderBodies(bodiesData)
    console.log("GS.fromKeplerOrbitData() bodiesDataOrdered: ", bodiesDataOrdered)

    const bodies: NewtonianBody[] = bodiesDataOrdered.map(bodyData=>
      NewtonianBody.fromData(
        bodyData as OrbiterData,
        bodiesDataOrdered.find(b=>b.id==bodyData.orbitCenterId),
        ...args
      )
    )
    const gs = new GravitationalSystem(bodies)

    console.log("GS.fromKeplerOrbitData() gs: ", gs)
    return gs
  }
}