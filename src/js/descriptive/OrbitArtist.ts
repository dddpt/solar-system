import * as THREE from 'three'


export class OrbitArtist{
  constructor(){
    this.object3d = new THREE.Object3D()
  }
}

export class EclipticOrthogonalsOrbitArtist{
  /**
   * 
   * @param {*} orbit an Orbit object with computeState() method
   * @param {*} msecOrthoInterval msec interval at which orthogonals must be drawn
   * @param {*} msecSegmentsInterval msec interval at which segments are to be drawn
   */
  constructor(orbit, msecOrthoInterval, msecSegmentsInterval, color=0x222222){
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
    while(state.posOnOrbit>=previousPosOnOrbit){
      points.push(state.positionVector)
      previousPosOnOrbit = state.posOnOrbit
      state = orbit.computeState(this.segmentsInterval, state.posOnOrbit, state.positionVector)
      iter++
    }
    points.push(state.positionVector)
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
      state = orbit.computeState(this.orthoInterval, state.posOnOrbit, state.positionVector)
      iter++
      //console.log("previousPosOnOrbit: ", previousPosOnOrbit)
      //console.log("state.posOnOrbit: ", state.posOnOrbit)
    }
    console.warn("orthig iter: ", iter)
    // BUG: DOES 129 ITERATIONS SOMETIME -> ??

  }

}