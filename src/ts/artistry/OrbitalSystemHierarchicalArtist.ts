import * as THREE from 'three'

import { SpatialObjectState } from "../core/SpaceObject";
import { OrbiterData, SpatialObjectData } from '../data/SolarSystemData';
import { AbstractOrbit } from '../descriptive/AbstractOrbit';
import { Artist, ArtistsGroup } from './Animated';
import { DescriptiveOrbitalSystem } from '../descriptive/DescriptiveOrbitalSystem';
import { tconsole } from '../utils';
import { Msec } from '../core/spatialUnits';


export class LocalOrbitArtist<OrbiterState extends SpatialObjectState, Orbit extends AbstractOrbit<OrbiterState>> extends ArtistsGroup{
  _type = "LocalOrbitArtist"
  orbit: Orbit
  constructor(orbit: Orbit, artistsFromOrbit: (o: Orbit)=>Artist[]){
    super()
    this.orbit=orbit
    const artists = artistsFromOrbit(this.orbit)
    this.add(...artists)
  }
  initAnimation(newDate: Date): void {
    this.orbit.initialize()
    this.animate(+newDate)
  }
  animate(msecTimestamp: Msec): void {
    const state = this.orbit.getState(msecTimestamp)
    this.object3d.position.x = state.position.x
    this.object3d.position.y = state.position.y
    this.object3d.position.z = state.position.z
    this.mobile.setRotationFromQuaternion(state.rotation)
  }
}

/** OrbitalSystem Artist building a hierarchy of THREE.Group
 * 
 * bulkier code than OrbitalSystemArtist
 * ?might be computationally lighter than a raw OrbitalSystemArtist for a DescriptiveOrbitalSystem?
 * 
 */
export class OrbitalSystemHierarchicalArtist<OrbiterState extends SpatialObjectState, Orbit extends AbstractOrbit<OrbiterState>> extends ArtistsGroup{
  _type = "OrbitalSystemHierarchicalArtist"
  system: DescriptiveOrbitalSystem<OrbiterState, Orbit>;
  nonOrbitArtists: Map<string, ArtistsGroup>
  localArtists: Map<string, LocalOrbitArtist<OrbiterState, Orbit>>
  globalArtists: Map<string, Artist[]>
  constructor(
    system: DescriptiveOrbitalSystem<OrbiterState, Orbit>,
    artistFromNonOrbitData: (o: SpatialObjectData)=>ArtistsGroup,
    localArtistsFromOrbit: (o: Orbit)=>Artist[],
    globalArtistsFromOrbit: (o: Orbit)=>Artist[],
  ){
      super()
      this.nonOrbitArtists = new Map<string, ArtistsGroup>()
      for(let [bodyId, bodyData] of system.nonOrbitingBodies.entries()){
        const artist = artistFromNonOrbitData(bodyData)
        this.nonOrbitArtists.set(bodyId, artist)
        this.add(artist)
      }
      tconsole.log("DOSA.constructor() nonOrbitArtists", this.nonOrbitArtists)

      
      this.localArtists = new Map<string, LocalOrbitArtist<OrbiterState, Orbit>>()
      this.globalArtists = new Map<string, Artist[]>()
      for(let [orbitId, orbit] of system.bodies.entries()){
        
        const globalArtists = globalArtistsFromOrbit(orbit)
        this.globalArtists.set(orbitId, globalArtists)
        globalArtists.forEach(ga=>this.add(ga))
        tconsole.log("DOSA.constructor() orbitId "+orbitId, " globalArtists", globalArtists)

        const localArtist = new LocalOrbitArtist(orbit, localArtistsFromOrbit)
        tconsole.log("DOSA.constructor() orbitId "+orbitId, " globalArtist", localArtist)
        this.localArtists.set(orbitId, localArtist)
        // should always be set as system serves orbits hierarchically
        let centerArtist: ArtistsGroup = this.localArtists.get(orbit.orbitCenterId)
        if(!centerArtist){
          centerArtist = this.nonOrbitArtists.get(orbit.orbitCenterId)
        }
        tconsole.log("DOSA.constructor() init orbitId "+ orbitId, "orbit.orbitCenterId", orbit.orbitCenterId, centerArtist)
        centerArtist.add(localArtist)
      }
  }
}
