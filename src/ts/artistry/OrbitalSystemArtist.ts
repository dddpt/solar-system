import * as THREE from 'three'

import { SpaceObject, SpatialObjectState } from "../core/SpaceObject";
import { OrbiterData, SpatialObjectData } from '../data/SolarSystemData';
import { AbstractOrbit } from '../descriptive/AbstractOrbit';
import { Artist, ArtistsGroup } from './Animated';
import { DescriptiveOrbitalSystem } from '../descriptive/DescriptiveOrbitalSystem';
import { OrbiterArtist } from './OrbiterArtist';
import { tconsole } from '../utils';
import { OrbitalSystem } from '../core/OrbitalSystem';

export class OrbitalSystemArtist<OrbiterState extends SpatialObjectState, Orbit extends SpaceObject<OrbiterState>> extends ArtistsGroup{
  _type = "OrbitalSystemArtist"
  system: OrbitalSystem<OrbiterState, Orbit>;
  artists: Map<string, ArtistsGroup>

  constructor(
    system: OrbitalSystem<OrbiterState, Orbit>,
    artistFromNonOrbitData: (system: OrbitalSystem<OrbiterState, Orbit>, o: SpatialObjectData)=>Artist[],
    localArtistsFromOrbit: (system: OrbitalSystem<OrbiterState, Orbit>, o: Orbit)=>Artist[],
    globalArtistsFromOrbit: (system: OrbitalSystem<OrbiterState, Orbit>, o: Orbit)=>Artist[],
  ){
      super()
      this.artists = new Map<string, ArtistsGroup>()
      for(let bodyData of system.getOtherBodiesData()){
        const asog = new ArtistsGroup()
        artistFromNonOrbitData(system, bodyData).forEach(artist => asog.add(artist))
        this.artists.set(bodyData.id, asog)
        this.add(asog)
      }

      for(let [orbitId, orbit] of system.bodies.entries()){
        const asog = new ArtistsGroup()
        // TODO: no longer any difference between local and global artists...
        // set up child class to make the diff'
        const orbitArtist = new OrbiterArtist(system, orbitId, localArtistsFromOrbit)
        asog.add(orbitArtist)
        asog.add(...globalArtistsFromOrbit(system, orbit))
        this.artists.set(orbitId, asog)
        this.add(asog)
      }
  }
}
