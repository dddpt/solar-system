
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
    let newStates: NewtonianState[] = bodies.map(body=>body.getState(closestTimestamp).clone())
    

    // compute instant force & acceleration at intervals for better precision
    let intervalComputed = 0
    while(intervalComputed<msecInterval){
      const deltaT = Math.min(msecInterval-intervalComputed, config.animateSimulationMsecMaxInterval)
      //console.log("  + msecSimulInterval-intervalComputed: ", msecSimulInterval-intervalComputed, ", config.simMsecMaxInterval: ",config.animateSimulationMsecMaxInterval, "deltaT: ", deltaT, ", deltaT as days:", deltaT/d, ", as hours: ",  deltaT/h)

      this.computeStep(bodies, newStates, deltaT)

      //update intervalComputed
      intervalComputed += deltaT
    }

    for(let i=0; i<bodies.length; i++){
      bodies[i].cache.set(timestamp, newStates[i])
    }

    const newStatesMap = new Map<string, NewtonianState>()
    newStates.forEach((s,i)=>newStatesMap.set(bodies[i].id, s))
    return newStatesMap
  }


  /** Computes a single simulation step. INPLACE */
  computeStep(
    bodies: NewtonianBody[],
    states: NewtonianState[],
    deltaT: Msec
  ): NewtonianState[]{
    states.forEach(s =>{
      this.updateToNextPosition(s, deltaT)
    })

    // update force
    this.computeForceAcceleration(bodies, states)

    // update to next velocity
    states.forEach(s =>{
      this.updateToNextVelocity(s, deltaT)
    })
    return states
  }

  /** update state to next position and timestamp. INPLACE */
  updateToNextPosition(state: NewtonianState, deltaT: Msec){
    state.timestamp = state.timestamp+deltaT
    state.position.add(state.velocity.clone().multiplyScalar(deltaT))
    state.force = null
    state.acceleration = null
  }

  /** Computes Force, Acceleration and Velocity for all given states. INPLACE
   * 
   * - Force: computed as `force1 = GC * mass1 * massX / dist_to_X^2` where GC is gravitationalConstant
   * - Acceleration: `acc1 = force1 / mass1`
   * - Velocity: computed as `velocity1 = velocity1+acc1*deltaT`, velocity is assumed to be the remaining velocity from the last step. acceleration is added to it.
   * - Position is never touched
   */
  computeForceAcceleration(
    bodies: NewtonianBody[],
    states: NewtonianState[],
  ): NewtonianState[]{
    states.forEach(state=>{
      state.force = new THREE.Vector3(0,0,0)
      state.acceleration = new THREE.Vector3(0,0,0)
    })

    for(let i=0; i<bodies.length; i++){
      const b1 = bodies[i]
      const b1State = states[i]
      for(let j=i+1; j<bodies.length; j++){
        const b2 = bodies[j]
        const b2State = states[j]
        //tconsole.log("GS.cs() "+b1.id+"-"+b2.id, "")
        const dist = b1State.position.distanceTo(b2State.position)
        
        const forceNb = gravitationalConstant * b1.mass * b2.mass / (dist**2)
        const force = b1State.position.clone().sub(b2State.position).normalize().multiplyScalar(forceNb)
        b2State.force.add(force)
        b1State.force.add(force.negate())
      }
      b1State.acceleration = b1State.force.clone().divideScalar(b1.mass)
    }
    return states
  }

  /** update state to next position. INPLACE */
  updateToNextVelocity(state: NewtonianState, deltaT: Msec){
    state.velocity = state.velocity.clone().add(state.acceleration.clone().multiplyScalar(deltaT))
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

    // compute initial states Force and Acceleration
    gs.computeForceAcceleration(bodies, bodies.map(b=>b.getInitialState()))

    console.log("GS.fromKeplerOrbitData() gs: ", gs)
    return gs
  }
}