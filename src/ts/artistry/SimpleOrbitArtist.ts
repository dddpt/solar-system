import * as THREE from "three";
import { SpaceObject, SpatialObjectState } from "../core/SpaceObject";
import { Msec } from "../core/spatialUnits";
import { AbstractOrbit } from "../descriptive/AbstractOrbit";
import { ArtistsGroup } from "./Animated";
import { OrbitalSystem } from "../core/OrbitalSystem";
import { StaticOrbitArtist } from "./StaticOrbitArtist";

export class SimpleOrbitArtist<OrbiterState extends SpatialObjectState> extends StaticOrbitArtist<OrbiterState>{
  _type = "SimpleOrbitArtist"
    color: number;

    orthogonals: THREE.Line[];
    orbitEllipse: THREE.Line;
  /**
   * 
   * @param {*} orbit an Orbit object with computeState() method
   * @param {*} msecOrthoInterval msec interval at which orthogonals must be drawn
   * @param {*} msecSegmentsInterval msec interval at which segments are to be drawn
   */
  constructor(
    segmentsStates: OrbiterState[],
    color: number=0x222222
  ){
    super(segmentsStates)

    this.color = color

    this.orthogonals = []
    this.orbitEllipse = null;

    const material = new THREE.LineBasicMaterial({ color })

    // the ellipse itself
    let points = []
    segmentsStates.forEach(state=>{
      points.push(state.position.clone())
    })

    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    this.orbitEllipse = new THREE.Line( geometry, material );
    this.mobile.add(this.orbitEllipse)

  }
  animate(msecTimestamp: Msec): void {}

  static fullOrbit<OrbiterState extends SpatialObjectState>(
    system: OrbitalSystem<OrbiterState, SpaceObject<OrbiterState>>,
    orbit: SpaceObject<OrbiterState>,
    color: number=0x222222,
    segmentsNbSteps?: number,
    segmentsStepInterval?: Msec,
  ): SimpleOrbitArtist<OrbiterState>{
    console.log("SimpleOrbitArtist.fullOrbit() for orbit ",
      orbit.data.id, 
      " with segmentsNbSteps", segmentsNbSteps,
      ", segmentsStepInterval", segmentsStepInterval,
    )
    const segmentsStates: OrbiterState[] = system.getFullOrbitStates(orbit.data.id, segmentsNbSteps, segmentsStepInterval)

    return new SimpleOrbitArtist(segmentsStates, color)
  }

  static fromTo<OrbiterState extends SpatialObjectState>(
    system: OrbitalSystem<OrbiterState, SpaceObject<OrbiterState>>,
    orbit: SpaceObject<OrbiterState>,
    fromTimestamp: number,
    toTimestamp: number,
    color: number=0x222222,
    segmentsNbSteps?: number,
    segmentsStepInterval?: Msec,
  ){
    console.log("SimpleOrbitArtist.fromTo() for orbit ",
      orbit.data.id, 
      " from ", fromTimestamp, 
      " to ", toTimestamp, 
      " with segmentsNbSteps", segmentsNbSteps,
      ", segmentsStepInterval", segmentsStepInterval,
    )
    const segmentsStates: OrbiterState[] = system.getStatesFromTo(orbit.data.id, fromTimestamp, toTimestamp, segmentsNbSteps, segmentsStepInterval)

    return new SimpleOrbitArtist(segmentsStates, color)
  }
}