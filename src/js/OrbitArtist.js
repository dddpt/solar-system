import * as THREE from 'three'
import {mod, ellipse, eccentricAnomalyNewtonsMethod, binarySearch, ConsoleInterval} from "./utils.js"

import { AnimatedSpaceObject, AnimatedSpaceObjectsGroup } from './SpaceObject.js'
import {msec, sec, d,w, month, yr} from "./spatialUnits.js"


export class OrbitArtist{
  constructor(){
    this.object3d = new THREE.Object3D()
  }
}

export class EclipticOrthogonalsOrbitArtist{
  /**
   * 
   * @param {*} orbit an Orbit object with computeState() method
   * @param {*} quaternion quaternion representing rotation of orbit's plane relative to ecliptic
   * @param {*} msecOrthoInterval msec interval at which orthogonals must be drawn
   */
  constructor(orbit, msecOrthoInterval, msecSegmentsInterval, color=0x222222){
    console.log("EclipticOrthogonalsOrbitArtist msecOrthoInterval years: ", msecOrthoInterval/yr)
    console.log("EclipticOrthogonalsOrbitArtist msecSegmentsInterval years: ", msecSegmentsInterval/yr)
    this.orbit = orbit
    this.orthoInterval = msecOrthoInterval
    this.segmentsInterval = msecSegmentsInterval
    this.color = color

    this.object3d = new THREE.Group()
    this.orthogonals = []
    this.orbitEllipse = null;

    const material = new THREE.LineBasicMaterial({ color })
    const initState = orbit.computeState(0, 0)

    // the ellipse itself
    let points = []
    let state = initState
    let iter = 0
    let previousPosOnOrbit = 0
    points.push(state.positionVector)
    while(state.posOnOrbit>=previousPosOnOrbit){
      points.push(state.positionVector)
      previousPosOnOrbit = state.posOnOrbit
      state = orbit.computeState(state.posOnOrbit, this.segmentsInterval, state.positionVector)
      iter++
    }
    console.log("line iter: ", iter)
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    this.orbitEllipse = new THREE.Line( geometry, material );
    this.object3d.add(this.orbitEllipse)

    // the orthogonals
    state = initState
    iter=0
    previousPosOnOrbit = 0
    while(state.posOnOrbit>=previousPosOnOrbit){
      const planePoint = state.positionVector.clone()
      planePoint.y = 0
      const orthoGeometry = new THREE.BufferGeometry().setFromPoints([state.positionVector, planePoint])
      const orthogonal = new THREE.Line( orthoGeometry, material );
      this.orthogonals.push(orthogonal)
      this.object3d.add(orthogonal)
      previousPosOnOrbit = state.posOnOrbit
      state = orbit.computeState(state.posOnOrbit, this.orthoInterval, state.positionVector)
      iter++
      //console.log("previousPosOnOrbit: ", previousPosOnOrbit)
      //console.log("state.posOnOrbit: ", state.posOnOrbit)
    }
    console.log("orthig iter: ", iter)
    // BUG: DOES 129 ITERATIONS SOMETIME -> ??

  }

}