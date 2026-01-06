import * as THREE from 'three'
import { AbstractOrbit } from '../descriptive/AbstractOrbit'
import { Msec } from '../core/spatialUnits'
import { SpaceObject, SpatialObjectState } from '../core/SpaceObject'
import { KeplerOrbit } from '../descriptive/KeplerOrbit'
import { Artist, ArtistsGroup } from './Animated'
import { DescriptiveOrbitalSystem } from '../descriptive/DescriptiveOrbitalSystem'
import { OrbitalSystem } from '../core/OrbitalSystem'




export class OrbiterArtist<OrbiterState extends SpatialObjectState, Orbit extends SpaceObject<OrbiterState>> extends ArtistsGroup{
  _type = "OrbiterArtist"
  system: OrbitalSystem<OrbiterState, Orbit>
  orbitId: string
  constructor(
    system: OrbitalSystem<OrbiterState, Orbit>,
    orbitId: string,
    artistsFromOrbit: (system: OrbitalSystem<OrbiterState, Orbit>, o: Orbit)=>Artist[]
  ){
    super()
    this.system=system
    this.orbitId=orbitId
    const artists = artistsFromOrbit(this.system, this.system.getBody(orbitId))
    this.add(...artists)
  }
  initAnimation(newDate: Date): void {
    this.system.initialize()
    this.animate(+newDate)
  }
  animate(msecTimestamp: Msec): void {
    const state = this.system.getState(msecTimestamp, this.orbitId)
    this.object3d.position.x = state.position.x
    this.object3d.position.y = state.position.y
    this.object3d.position.z = state.position.z
    this.mobile.setRotationFromQuaternion(state.rotation)
  }
}

