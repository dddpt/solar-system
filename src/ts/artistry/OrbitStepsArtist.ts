import * as THREE from "three";
import { SpaceObject, SpatialObjectState } from "../core/SpaceObject";
import { Msec, Km, km, Au } from "../core/spatialUnits";
import { AbstractOrbit } from "../descriptive/AbstractOrbit";
import { ArtistsGroup } from "./Animated";
import { OrbitalSystem } from "../core/OrbitalSystem";
import { ColoredSphere } from "./PlanetArtist";
import { StaticOrbitArtist } from "./StaticOrbitArtist";

export class OrbitStepsArtist<OrbiterState extends SpatialObjectState> extends StaticOrbitArtist<OrbiterState>{
  _type = "OrbitStepsArtist"
    color: number;
    sphereSize: Km;

  /**
   * 
   * @param {*} orbit an Orbit object with computeState() method
   * @param {*} interval msec interval at which orthogonals must be drawn
   */
  constructor(
    states: OrbiterState[],
    auSphereSize: Au = 4000*km,
    color: number=0x222222,
  ){
    super(states)

    this.sphereSize = auSphereSize
    this.color = color

    states.forEach(state=>{
      const sphere = new ColoredSphere(auSphereSize, color)
      sphere.object3d.position.x = state.position.x
      sphere.object3d.position.y = state.position.y
      sphere.object3d.position.z = state.position.z
      // TOTHINK relatedArtist = this ?dangerous?
      sphere.object3d.userData.relatedArtist = this
      sphere.object3d.userData.state = state
      this.add(sphere)
    })

  }
  animate(msecTimestamp: Msec): void {}

  static fullOrbit<OrbiterState extends SpatialObjectState>(
    system: OrbitalSystem<OrbiterState, SpaceObject<OrbiterState>>,
    orbit: SpaceObject<OrbiterState>,
    auSphereSize: Au = 4000*km,
    color: number=0x222222,
    nbSteps?: number,
    stepInterval?: Msec,
  ): OrbitStepsArtist<OrbiterState>{
    const states: OrbiterState[] = system.getFullOrbitStates(orbit.data.id, nbSteps, stepInterval)

    return new OrbitStepsArtist(states, auSphereSize, color)
  }

  static fromTo<OrbiterState extends SpatialObjectState>(
    system: OrbitalSystem<OrbiterState, SpaceObject<OrbiterState>>,
    orbit: SpaceObject<OrbiterState>,
    fromTimestamp: number,
    toTimestamp: number,
    auSphereSize: Au = 4000*km,
    color: number=0x222222,
    nbSteps?: number,
    stepInterval?: Msec,
  ){
    const states: OrbiterState[] = system.getStatesFromTo(orbit.data.id, fromTimestamp, toTimestamp, nbSteps, stepInterval)

    return new OrbitStepsArtist(states, auSphereSize, color)

  }

}