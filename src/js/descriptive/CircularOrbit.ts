import * as THREE from 'three'

import {AbstractOrbit} from "./AbstractOrbit.js"

const twoPi = 2*Math.PI

/** CircularOrbit
 * 
 * no computeState() workflow, initAnimation() doesn't take newDate into account
  */
 export class CircularOrbit extends AbstractOrbit{
  constructor(initDate, msecOrbitalPeriod, auSemiMajorAxis, radMeanAnomaly, semiMajorAxisToOrbitRadius=x=>x){
    super(initDate)

    this.orbitalPeriod = msecOrbitalPeriod
    this.semiMajorAxis = auSemiMajorAxis
    this.meanAnomaly = radMeanAnomaly
    this.orbitRadius = semiMajorAxisToOrbitRadius(this.semiMajorAxis)
    this.yAngleSpeedFactor = twoPi / this.orbitalPeriod
    this.lastAnimateTimestamp = 0
  }

  yAngleAtMsecTimestamp(msecSimulTimestamp){
    return (msecSimulTimestamp * this.yAngleSpeedFactor) % twoPi
  }
  yAngleInInterval(msecSimulTimestamp1, msecSimulTimestamp2){
    return this.yAngleAtMsecTimestamp(msecSimulTimestamp2-msecSimulTimestamp1)
  }

  /** Resets mobile position to initDate position
   * 
   * doesn't take newDate into account*/
  initAnimation(newDate){
      this.mobile.position.x = this.orbitRadius
      this.object3d.rotateY(this.meanAnomaly)
      this.mobile.rotateY(-this.meanAnomaly)
  }

  /** */
  animate(msecSimulTimestamp){
    const yAngle = this.yAngleInInterval(this.lastAnimateTimestamp, msecSimulTimestamp)
    this.object3d.rotateY(yAngle)
    this.mobile.rotateY(-yAngle)
    this.lastAnimateTimestamp = msecSimulTimestamp
    this.currentSimulTimestamp += msecSimulTimestamp- this.lastAnimateTimestamp
  }

  getPath(segments=128, color= 0x222222){
    let material = new THREE.LineBasicMaterial( { color } )
    let geometry = new THREE.CircleGeometry( this.orbitRadius, segments )
    // Remove center vertex
    geometry.vertices.shift()
    let orbitCircle = new THREE.LineLoop( geometry, material )
    return orbitCircle
  }

  /** Creates CircularOrbit from planet data
   * 
   * Expects a o.object3d
   */
  static fromData(o, orbitCenter){
    return new CircularOrbit(
      o.epoch,
      o.orbitalPeriod,
      o.semiMajorAxis)
  }
}