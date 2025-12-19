
import * as THREE from 'three'

import { AnimatedSpaceObjectsGroup } from '../core/SpaceObject'
import {msec, sec, d,h,w, month, yr, kg, gravitationalConstant, Msec} from "../core/spatialUnits"
import {config} from "../config"
import { binarySearch, tconsole } from '../utils'
import { AnimatedNewtonianBody, NewtonianBody } from './NewtonianBody'


export class AnimatedGravitationalSystem extends AnimatedSpaceObjectsGroup{
  bodies: AnimatedNewtonianBody[];
  computer: GravitationalSystem;
  currentTimestamp: number;
  constructor(initDate: Date, animatedNewtonianBodies: AnimatedNewtonianBody[], integratorClass=GravitationalSystem){
    super(new THREE.Group())
    animatedNewtonianBodies.forEach(body =>{
      this.add(body)
    })
    this.bodies=(this.children as AnimatedNewtonianBody[])
    this.computer = new integratorClass(initDate, this.bodies.map(b=>b.data))
    this.currentTimestamp = +initDate
  }
  
  /** */
  initAnimation(newDate){
    this.computeStateAtDate(this.currentTimestamp)
    this.currentTimestamp = +newDate
    // iiniiit alll
    super.initAnimation(newDate)
  }

  /** */
  animate(msecSimulTimestamp){
    const msecInterval = msecSimulTimestamp - this.currentTimestamp

    //console.log("msecSimulTimestamp: ", msecSimulTimestamp, ", this.currentTimestamp: ", this.currentTimestamp, ", msecInterval: ", msecInterval)
    this.computeState(msecInterval)
    this.currentTimestamp = msecSimulTimestamp
    // newtonian mechaniiics
    super.animate(msecSimulTimestamp)
  }
  
  /** calls this.computer GravitationalSystem.computeState() 
  * 
  * @param {number} msecSimulInterval time interval (as msec) that for which orbit has to be computed
  * @param {boolean} inPlace whether to update the bodies in place or return copies TODO
  */
  computeState(msecSimulInterval){
    return this.computer.computeState(msecSimulInterval, true)
  }

  /** calls this.computer GravitationalSystem.computeStateAtDate() 
  * 
  * @param {Date} date fixed date at which to compute state
  */
  computeStateAtDate(date){
    return this.computer.computeStateAtDate(date, true)
  }

}


export class GravitationalSystem{
  bodies: NewtonianBody[];
  currentTimestamp: number;
  /** Bodies should be a list of NewtonianBody */
  constructor(initDate: Date|number, newtonianBodies: NewtonianBody[]){
    this.bodies=newtonianBodies
    this.currentTimestamp = +initDate
  }

  /** TODO: Computes instant Force & acceleration for all bodies given their current relative positions&masses*/
  computeForceAcceleration(inPlace=true){}
  /** TODO: Adds Acceleration to the speed */
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
  * @param {number} msecSimulInterval time interval (as msec) that for which orbit has to be computed
  * @param {boolean} inPlace whether to update the bodies in place or return copies
  */
  computeState(msecSimulInterval: Msec, inPlace: boolean=true): NewtonianBody[]{
    //console.log("COMPUTE STATE msecSimulInterval: ", msecSimulInterval, ", msecSimulInterval as days:", msecSimulInterval/d, ", as hours: ",  msecSimulInterval/h)
    const bodies = inPlace? this.bodies : this.bodies.map(b=>b.clone())

    // compute instant force & acceleration at intervals for better precision
    let intervalComputed = 0
    while(intervalComputed<msecSimulInterval){
      const deltaT = Math.min(msecSimulInterval-intervalComputed, config.animateSimulationMsecMaxInterval)
      //console.log("  + msecSimulInterval-intervalComputed: ", msecSimulInterval-intervalComputed, ", config.simMsecMaxInterval: ",config.animateSimulationMsecMaxInterval, "deltaT: ", deltaT, ", deltaT as days:", deltaT/d, ", as hours: ",  deltaT/h)
      // update positions
      bodies.forEach(b=>{
        b.position.add(b.speed.clone().multiplyScalar(msecSimulInterval))
        b.force = new THREE.Vector3()
      })
      // update force
      /*let currentPrintTimestamp= +(new Date())
      if(currentPrintTimestamp-lastPrintTimestamp>1500){
          console.log("COMPUTE STATE")
      }*/
     tconsole.log("COMPUTE STATE")
      for(let i=0; i<bodies.length; i++){
        const b1 = bodies[i]
        for(let j=i+1; j<bodies.length; j++){
          const b2 = bodies[j]
          tconsole.log("- start b1.position", b1.position, "b2.position")
          const dist = b1.position.distanceTo(b2.position)
          
          const forceNb = gravitationalConstant * b1.mass * b2.mass / dist
          const force = b1.position.clone().sub(b2.position).normalize().multiplyScalar(forceNb)
          b2.force.add(force)
          b1.force.add(force.negate())
          tconsole.log("- b1.position", b1.position, "b2.position", b2.position, "dist", dist, "forceNb", forceNb, "b2.force", b2.force, "b1.force", b1.force)
        }
        b1.acceleration = b1.force.divideScalar(b1.mass)
        b1.speed.add(b1.acceleration.clone().multiplyScalar(msecSimulInterval))
        tconsole.log("    - pos: ",b1.position.clone(), ", spd: ",b1.speed.clone(), ", acc: ",b1.acceleration.clone(), ", force: ",b1.force.clone())
      }
      //update intervalComputed
      intervalComputed += deltaT
    }
    return bodies
  }

  /** compute the state of the Orbit's mobile (position, orientation, etc...) from a date
  * 
  * @param {Date} date fixed date at which to compute state
  * @param {boolean} inPlace sdsd
  */
  computeStateAtDate(date, inPlace:boolean=true){
    // if date: compute from initial date&position
    const msecSimulInterval = (+date) - (+this.currentTimestamp)
    return this.computeState(msecSimulInterval, inPlace)
  }

  clone(){
    return new GravitationalSystem(this.currentTimestamp, this.bodies.map(b=>b.clone()))
  }
}