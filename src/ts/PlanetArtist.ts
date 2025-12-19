import * as THREE from 'three'

import { mercury, OrbiterData, SpatialObjectData } from "./data/SolarSystemData"
import { AnimatedSpaceObject } from './core/SpaceObject'
import { Msec } from './core/spatialUnits'


export class PlanetArtist extends AnimatedSpaceObject{
  constructor(){
    super(new THREE.Object3D())
  }
  initAnimation(newDate: Date){}
  animate(msecSimulTimestamp: Msec){}
}

export class ColoredSphere extends PlanetArtist{
  nbSphereSegments: number;
  geometry: THREE.SphereBufferGeometry;
  material: THREE.MeshToonMaterial;
  object3d: THREE.Mesh
  constructor(auRadius, color, scaleMagnifier = 100){
    super()

    this.nbSphereSegments = radiusToThreeSphereNbSegments(auRadius)
    this.geometry = new THREE.SphereBufferGeometry(auRadius, this.nbSphereSegments, this.nbSphereSegments)
    this.material = new THREE.MeshToonMaterial({color: color})//, emissive: planet.color});
    this.object3d = new THREE.Mesh(this.geometry, this.material );  
    this.object3d.scale.set(scaleMagnifier, scaleMagnifier, scaleMagnifier)
  }
  /** does nothing */
  initAnimation(newDate: Date){}

  /** does nothing */
  animate(msecSimulTimestamp:Msec){}

  /** Creates ColoredSphere from planet data
   * 
   * Expects a o.meanRadius and o.color
   */
  static fromData(o: SpatialObjectData, scaleMagnifier=100){
    return new ColoredSphere(
      o.meanRadius,
      o.color,
      scaleMagnifier
    )
  }
}

const twoToMercuryRadius = 2 / mercury.meanRadius
export function radiusToThreeSphereNbSegments(radius){
  return Math.max(10, Math.round(20*Math.log(twoToMercuryRadius * radius)) )
}