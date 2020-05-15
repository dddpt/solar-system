import * as THREE from 'three'

import { AnimatedSpaceObjectsGroup } from '../core/SpaceObject.js'

export class AbstractOrbit extends AnimatedSpaceObjectsGroup{
  constructor(initDate){
    super(new THREE.Group())
    // mobile is the orbiter threejs group
    this.mobile = new THREE.Group()
    this.object3d.add(this.mobile)
    
    this.initDate = initDate
    this.currentSimulTimestamp = +initDate
  }
  /**ABSTRACT */
  getPath(segments=128, color= 0x555555){
    throw "Orbit.getPath(): abstract method called"
  }
  showPath(segments=128, color= 0x222222){
    this.pathObject3d = this.getPath(segments, color)
    this.pathObject3d.rotateX(Math.PI/2)
    this.object3d.add(this.pathObject3d)
  }
  hidePath(){
    this.object3d.remove(this.pathObject3d);
    this.pathObject3d = null
  }
  
  /**ABSTRACT */
  static fromOrbiterData(o, orbitCenter){
    throw "Orbit.fromOrbiterData(): abstract method called"
  }
}
