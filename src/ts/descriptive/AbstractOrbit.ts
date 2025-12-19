import * as THREE from 'three'

import { AnimatedSpaceObjectsGroup } from '../core/SpaceObject'
import { Msec } from '../core/spatialUnits'

export abstract class AbstractOrbit extends AnimatedSpaceObjectsGroup{
  initDate: Date
  currentSimulTimestamp: number
  pathObject3d: THREE.Object3D
  constructor(initDate: Date){
    super(new THREE.Group())
    // mobile is the orbiter threejs group
    this.mobile = new THREE.Group()
    this.object3d.add(this.mobile)
    
    this.initDate = initDate
    this.currentSimulTimestamp = +initDate
  }
  abstract computeState(msecSimulInterval: Msec, posOnOrbit: number, positionVector?: THREE.Vector3): {posOnOrbit: number, positionVector: THREE.Vector3};
  abstract computeStateAtDate(date: Date): {posOnOrbit: number, positionVector: THREE.Vector3};
  abstract getPath(segments:number, color: number): THREE.Object3D
  showPath(segments=128, color= 0x222222){
    this.pathObject3d = this.getPath(segments, color)
    this.pathObject3d.rotateX(Math.PI/2)
    this.object3d.add(this.pathObject3d)
  }
  hidePath(){
    this.object3d.remove(this.pathObject3d);
    this.pathObject3d = null
  }
  
  /**ABSTRACT static method */
  static fromData(o, orbitCenter){
    throw "Orbit.fromData(): abstract method called"
  }
}
