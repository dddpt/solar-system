import * as THREE from 'three'

import { AnimatedSpaceObject, AnimatedSpaceObjectsGroup } from "../core/SpaceObject";
import { OrbiterData, SpatialObjectData } from '../data/SolarSystemData';
import { AbstractOrbit } from './AbstractOrbit';

export interface DescriptiveOrbitalSystemElement{
  data: SpatialObjectData
  artist: AnimatedSpaceObject

}

export interface DescriptiveOrbitalSystemOrbiter extends DescriptiveOrbitalSystemElement{
  data: OrbiterData
  orbit: AbstractOrbit
}


export class DescriptiveOrbitalSystem extends AnimatedSpaceObjectsGroup{
  center: DescriptiveOrbitalSystemElement
  bodies: { [key: string]: DescriptiveOrbitalSystemElement};
  orbiters: DescriptiveOrbitalSystemOrbiter[];

  constructor(centerData: SpatialObjectData, orbitersData: OrbiterData[], orbitClass: any, OrbiterArtistClass: any){
    super(new THREE.Group())
    const self = this
    this.bodies= {}
    this.center = {
      data: centerData,
      artist: OrbiterArtistClass.fromData(centerData)
    }
    this.bodies[centerData.name] = this.center
    this.orbiters = orbitersData.map(od=>{
      const o: DescriptiveOrbitalSystemOrbiter = {
        data: od,
        artist: OrbiterArtistClass.fromData(od),
        orbit: orbitClass.fromData(od, self.center.data)
      }
      o.orbit.add(o.artist)
      self.add(o.orbit)
      this.bodies[od.name] = o
      return o
    })
    this.center.artist = OrbiterArtistClass.fromData(this.center.data)
    self.add(this.center.artist)
  }
}
