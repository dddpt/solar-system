import * as THREE from 'three'

import { mercury, OrbiterData, SpatialObjectData } from "../data/SolarSystemData"
import { Artist } from './Animated'
import { Au, Msec } from '../core/spatialUnits'


export abstract class PlanetArtist extends Artist{
  _type = "PlanetArtist"
  constructor(object3d: THREE.Object3D){
    super(object3d)
  }
}

export class ColoredSphere extends PlanetArtist{
  _type = "ColoredSphere"
  nbSphereSegments: number;
  geometry: THREE.SphereBufferGeometry;
  material: THREE.MeshToonMaterial;
  object3d: THREE.Mesh
  constructor(auRadius:Au, color:number, scaleMagnifier = 100){
    const nbSphereSegments = radiusToThreeSphereNbSegments(auRadius)
    const geometry = new THREE.SphereBufferGeometry(auRadius, nbSphereSegments, nbSphereSegments)
    const material = new THREE.MeshToonMaterial({color: color})//, emissive: planet.color});
    const object3d = new THREE.Mesh(geometry, material );  
    object3d.scale.set(scaleMagnifier, scaleMagnifier, scaleMagnifier)

    super(object3d)

    this.nbSphereSegments = nbSphereSegments
    this.geometry = geometry
    this.material = material  
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