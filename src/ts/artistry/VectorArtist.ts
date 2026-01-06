import * as THREE from "three";
import { Msec } from "../core/spatialUnits";
import { Artist } from "./Animated";

export class VectorArtist extends Artist{
  _type = "VectorArtist"
  vector: THREE.Line;
  scale: number;
  pointTo: THREE.Vector3;
  pointFrom: THREE.Vector3;
  lineMaterialParams?: THREE.LineBasicMaterialParameters;
  /** */
  constructor(pointTo: THREE.Vector3, pointFrom?: THREE.Vector3, lineMaterialParams?: THREE.LineBasicMaterialParameters, scale: number=1, headScale=0.1){
    super(new THREE.Group())
    if(!pointFrom){
      pointFrom = new THREE.Vector3(0,0,0)
    }
    if(!lineMaterialParams){
      lineMaterialParams = {
        color: 0x222222,
        linewidth: 2 // "only works with SVGRenderer..."
      }
    }
    const material = new THREE.LineBasicMaterial(lineMaterialParams)
    const orthoGeometry = new THREE.BufferGeometry().setFromPoints([pointFrom.clone(), pointTo.clone()])
    this.vector = new THREE.Line( orthoGeometry, material );
    this.object3d.add(this.vector)
    this.pointTo = pointTo
    this.lineMaterialParams = lineMaterialParams

    this.object3d.scale.x = scale
    this.object3d.scale.y = scale
    this.object3d.scale.z = scale

    /* basic code to draw polygon
    let polyShape = new THREE.Shape(coordinates.map((coord) => new THREE.Vector2(coord.x, coord.y)))
    const polyGeometry = new THREE.ShapeGeometry(polyShape);
    polyGeometry.setAttribute("position", new THREE.Float32BufferAttribute(coordinates.map(coord => [coord.x, coord.y, coord.elevation]).flat(), 3))
    let polygon = new THREE.Mesh(polyGeometry, new THREE.MeshBasicMaterial({ color: "ColorYouWant, side: THREE.DoubleSide}))
    scene.add(polygon);*/
  }
    /** */
  initAnimation(newDate: Date){}
  animate(msecTimestamp: Msec): void {}
}

export class OrthogonalArtist extends Artist{
  _type = "OrthogonalArtist"
  point: THREE.Vector3;
  lineMaterialParams?: THREE.LineBasicMaterialParameters
  /** */
  constructor(point: THREE.Vector3, lineMaterialParams?: THREE.LineBasicMaterialParameters){
    if(!lineMaterialParams){
      lineMaterialParams = {
        color: 0x222222,
        linewidth: 2 // "only works with SVGRenderer..."
      }
    }
    const planePoint = point.clone()
    planePoint.y = 0
    const material = new THREE.LineBasicMaterial(lineMaterialParams)
    const orthoGeometry = new THREE.BufferGeometry().setFromPoints([planePoint, point.clone()])
    const orthogonal = new THREE.Line( orthoGeometry, material );
    super(orthogonal)
    this.point = point
    this.lineMaterialParams = lineMaterialParams
  }
    /** */
  initAnimation(newDate: Date){}
  animate(msecTimestamp: Msec): void {}
}