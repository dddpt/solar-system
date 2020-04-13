import * as THREE from 'three'

import { mercury } from "./SolarSystemData.js"
import { AnimatedSpaceObject } from './SpaceObject.js'


export class PlanetArtist extends AnimatedSpaceObject{
  constructor(){
    super(new THREE.Object3D())
  }
}

export class ColoredSphere extends PlanetArtist{
  constructor(auRadius, color, scaleMagnifier = 1200){
    super()

    this.nbSphereSegments = radiusToThreeSphereNbSegments(auRadius)
    this.geometry = new THREE.SphereBufferGeometry(auRadius, this.nbSphereSegments, this.nbSphereSegments)
    this.material = new THREE.MeshToonMaterial({color: color})//, emissive: planet.color});
    this.object3d = new THREE.Mesh(this.geometry, this.material );  
    this.object3d.scale.set(scaleMagnifier, scaleMagnifier, scaleMagnifier)
  }
  /** does nothing */
  initAnimation(newDate){
  }

  /** does nothing */
  animate(secSimulTimestamp){
  }

  /** Creates ColoredSphere from planet data
   * 
   * Expects a o.meanRadius and o.color
   */
  static fromData(o, scaleMagnifier=1200){
    return new ColoredSphere(
      o.meanRadius,
      o.color,
      scaleMagnifier
    )
  }
}

const twoToMercuryRadius = 2 / mercury.meanRadius
export function radiusToThreeSphereNbSegments(radius){
  return Math.max(5,Math.round(10*Math.log(twoToMercuryRadius * radius)))
}