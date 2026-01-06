import * as THREE from "three";
import { SpaceObject, SpatialObjectState } from "../core/SpaceObject";
import { Msec, Km, km, Au } from "../core/spatialUnits";
import { AbstractOrbit } from "../descriptive/AbstractOrbit";
import { ArtistsGroup } from "./Animated";
import { OrbitalSystem } from "../core/OrbitalSystem";
import { ColoredSphere } from "./PlanetArtist";

export class StaticOrbitArtist<OrbiterState extends SpatialObjectState> extends ArtistsGroup{
  _type = "StaticOrbitArtist"
    states: OrbiterState[]

  constructor(states: OrbiterState[]){
    super()

    this.object3d.position.x=0;
    this.object3d.position.y=0;
    this.object3d.position.z=0;
    this.states = states
  }
  animate(msecTimestamp: Msec): void {}
}