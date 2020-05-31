
import * as THREE from 'three'

import { AnimatedSpaceObjectsGroup } from '../core/SpaceObject.js'
import {msec, sec, d,h,w, month, yr, kg, gravitationalConstant} from "../core/spatialUnits.js"
import {config} from "../config.js"
import { binarySearch } from '../utils.js'


export class AnimatedGravitationalSystem extends AnimatedSpaceObjectsGroup{
  constructor(initDate, animatedNewtonianBodies, integratorClass=GravitationalSystem){
    super(new THREE.Group())
    animatedNewtonianBodies.forEach(body =>{
      this.add(body)
    })
    this.bodies=this.children
    this.computer = new integratorClass(initDate, this.bodies.map(b=>b.data))
    this.currentTimestamp = initDate
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
  /** Bodies should be a list of NewtonianBody */
  constructor(initDate, newtonianBodies){
    this.bodies=newtonianBodies
    this.currentTimestamp = initDate
  }

  /** TODO: Computes instant Force & acceleration for all bodies given their current relative positions&masses*/
  computeForceAcceleration(inPlace=true){}
  /** TODO: Adds Acceleration to the speed */
  computeSpeed(msecSimulInterval, inPlace=true){}
  /** TODO: Adds speed to the position
   * 
   * TODO: have acceleration & speed next order derivations 
   */
  computePosition(msecSimulInterval, inPlace=true){}
  
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
  computeState(msecSimulInterval, inPlace=true){
    console.log("COMPUTE STATE msecSimulInterval: ", msecSimulInterval, ", msecSimulInterval as days:", msecSimulInterval/d, ", as hours: ",  msecSimulInterval/h)
    const bodies = inPlace? this.bodies : this.bodies.map(b=>b.clone())

    // compute instant force & acceleration at intervals for better precision
    let intervalComputed = 0
    while(intervalComputed<msecSimulInterval){
      const deltaT = Math.min(msecSimulInterval-intervalComputed, config.animateSimulationMsecMaxInterval)
      console.log("+ msecSimulInterval-intervalComputed: ", msecSimulInterval-intervalComputed, ", config.simMsecMaxInterval: ",config.animateSimulationMsecMaxInterval, "deltaT: ", deltaT, ", deltaT as days:", deltaT/d, ", as hours: ",  deltaT/h)
      // update positions
      bodies.forEach(b=>{
        b.position.add(b.speed.clone().multiplyScalar(msecSimulInterval))
        b.force = new THREE.Vector3()
      })
      // update force
      for(let i=0; i<bodies.length; i++){
        const b1 = bodies[i]
        for(let j=i+1; j<bodies.length; j++){
          const b2 = bodies[j]
          const dist = b1.position.distanceTo(b2.position)
          let force = gravitationalConstant * b1.mass * b2.mass / dist
          force = b1.position.clone().sub(b2.position).normalize().multiplyScalar(force)
          b2.force.add(force)
          b1.force.add(force.negate())
        }
        b1.acceleration = b1.force.divideScalar(b1.mass)
        b1.speed.add(b1.acceleration.clone().multiplyScalar(msecSimulInterval))
        console.log("  - pos: ",b1.position.clone(), ", spd: ",b1.speed.clone(), ", acc: ",b1.acceleration.clone(), ", force: ",b1.force.clone())
      }
      //update intervalComputed
      intervalComputed += deltaT
    }
    return bodies
  }

  /** compute the state of the Orbit's mobile (position, orientation, etc...) from a date
  * 
  * @param {Date} date fixed date at which to compute state
  */
  computeStateAtDate(date, inPlace=true){
    // if date: compute from initial date&position
    const msecSimulInterval = (+date) - (+this.currentTimestamp)
    return this.computeState(msecSimulInterval, inPlace)
  }

  clone(){
    return new GravitationalSystem(this.currentTimestamp, this.bodies.map(b=>b.clone()))
  }
}