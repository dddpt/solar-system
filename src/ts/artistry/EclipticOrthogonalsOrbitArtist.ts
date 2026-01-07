import * as THREE from "three";
import { SpaceObject, SpatialObjectState } from "../core/SpaceObject";
import { Msec } from "../core/spatialUnits";
import { AbstractOrbit } from "../descriptive/AbstractOrbit";
import { ArtistsGroup } from "./Animated";
import { OrbitalSystem } from "../core/OrbitalSystem";
import { StaticOrbitArtist } from "./StaticOrbitArtist";
import { SimpleOrbitArtist } from "./SimpleOrbitArtist";

export class EclipticOrthogonalsOrbitArtist<OrbiterState extends SpatialObjectState> extends StaticOrbitArtist<OrbiterState>{
  _type = "EclipticOrthogonalsOrbitArtist"
    color: number;

    orthogonals: THREE.Line[];

  constructor(
    orthogonalsStates: OrbiterState[],
    color: number=0x222222
  ){
    super(orthogonalsStates)


    this.color = color

    this.orthogonals = []

    const material = new THREE.LineBasicMaterial({ color })

    // the orthogonals
    orthogonalsStates.forEach(state=>{
      const planePoint = state.position.clone()
      planePoint.y = 0
      const orthoGeometry = new THREE.BufferGeometry().setFromPoints([state.position.clone(), planePoint])
      const orthogonal = new THREE.Line( orthoGeometry, material );
      this.orthogonals.push(orthogonal)
      this.mobile.add(orthogonal)
    })
  }
  animate(msecTimestamp: Msec): void {}

  static fullOrbit<OrbiterState extends SpatialObjectState>(
    system: OrbitalSystem<OrbiterState, SpaceObject<OrbiterState>>,
    orbit: SpaceObject<OrbiterState>,
    color: number=0x222222,
    orthoNbSteps?: number,
    orthoStepInterval?: Msec,
  ): EclipticOrthogonalsOrbitArtist<OrbiterState>{
    console.log("EclipticOrthogonalsOrbitArtist.fullOrbit() for orbit ",
      orbit.data.id, 
      ", orthoNbSteps", orthoNbSteps,
      ", orthoStepInterval", orthoStepInterval
    )
    const orthoStates: OrbiterState[] = system.getFullOrbitStates(orbit.data.id, orthoNbSteps, orthoStepInterval)

    return new EclipticOrthogonalsOrbitArtist(orthoStates, color)
  }

  static fromTo<OrbiterState extends SpatialObjectState>(
    system: OrbitalSystem<OrbiterState, SpaceObject<OrbiterState>>,
    orbit: SpaceObject<OrbiterState>,
    fromTimestamp: number,
    toTimestamp: number,
    color: number=0x222222,
    orthoNbSteps?: number,
    orthoStepInterval?: Msec,
  ){
    console.log("EclipticOrthogonalsOrbitArtist.fromTo() for orbit ",
      orbit.data.id, 
      " from ", fromTimestamp, 
      " to ", toTimestamp, 
      " with orthoNbSteps", orthoNbSteps,
      ", orthoStepInterval", orthoStepInterval,
    )
    const orthoStates: OrbiterState[] = system.getStatesFromTo(orbit.data.id, fromTimestamp, toTimestamp, orthoNbSteps, orthoStepInterval)

    return new EclipticOrthogonalsOrbitArtist(orthoStates, color)
  }
}








export class TraceAndOrthogonalsOrbitArtist<OrbiterState extends SpatialObjectState> extends SimpleOrbitArtist<OrbiterState>{
  _type = "EclipticOrthogonalsOrbitArtist"
    orthogonalsArtist: EclipticOrthogonalsOrbitArtist<OrbiterState>
  /**
   * 
   * @param {*} orbit an Orbit object with computeState() method
   * @param {*} msecOrthoInterval msec interval at which orthogonals must be drawn
   * @param {*} msecSegmentsInterval msec interval at which segments are to be drawn
   */
  constructor(
    segmentsStates: OrbiterState[],
    orthogonalsStates?: OrbiterState[],
    color: number=0x222222
  ){
    super(segmentsStates, color)

    if(!orthogonalsStates){
      orthogonalsStates = segmentsStates
    }
    this.orthogonalsArtist = new EclipticOrthogonalsOrbitArtist(orthogonalsStates, color)
  }
  animate(msecTimestamp: Msec): void {}

  static fullOrbit<OrbiterState extends SpatialObjectState>(
    system: OrbitalSystem<OrbiterState, SpaceObject<OrbiterState>>,
    orbit: SpaceObject<OrbiterState>,
    color: number=0x222222,
    segmentsNbSteps?: number,
    orthoNbSteps?: number,
    segmentsStepInterval?: Msec,
    orthoStepInterval?: Msec,
  ): TraceAndOrthogonalsOrbitArtist<OrbiterState>{
    console.log("TraceAndOrthogonalsOrbitArtist.fullOrbit() for orbit ",
      orbit.data.id, 
      " with segmentsNbSteps", segmentsNbSteps,
      ", orthoNbSteps", orthoNbSteps,
      ", segmentsStepInterval", segmentsStepInterval,
      ", orthoStepInterval", orthoStepInterval
    )
    const segmentsStates: OrbiterState[] = system.getFullOrbitStates(orbit.data.id, segmentsNbSteps, segmentsStepInterval)
    const orthoStates: OrbiterState[] = system.getFullOrbitStates(orbit.data.id, orthoNbSteps, orthoStepInterval)

    return new TraceAndOrthogonalsOrbitArtist(segmentsStates, orthoStates, color)
  }

  static fromTo<OrbiterState extends SpatialObjectState>(
    system: OrbitalSystem<OrbiterState, SpaceObject<OrbiterState>>,
    orbit: SpaceObject<OrbiterState>,
    fromTimestamp: number,
    toTimestamp: number,
    color: number=0x222222,
    segmentsNbSteps?: number,
    orthoNbSteps?: number,
    segmentsStepInterval?: Msec,
    orthoStepInterval?: Msec,
  ){
    console.log("TraceAndOrthogonalsOrbitArtist.fromTo() for orbit ",
      orbit.data.id, 
      " from ", fromTimestamp, 
      " to ", toTimestamp, 
      " with segmentsNbSteps", segmentsNbSteps,
      ", orthoNbSteps", orthoNbSteps,
      ", segmentsStepInterval", segmentsStepInterval,
      ", orthoStepInterval", orthoStepInterval
    )
    const segmentsStates: OrbiterState[] = system.getStatesFromTo(orbit.data.id, fromTimestamp, toTimestamp, segmentsNbSteps, segmentsStepInterval)
    const orthoStates: OrbiterState[] = system.getStatesFromTo(orbit.data.id, fromTimestamp, toTimestamp, orthoNbSteps, orthoStepInterval)

    return new TraceAndOrthogonalsOrbitArtist(segmentsStates, orthoStates, color)
  }
}