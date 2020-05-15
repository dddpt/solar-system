import * as THREE from 'three'

import { AnimatedSpaceObjectsGroup } from "./SpaceObject";
import { KeplerOrbit, CircularOrbit } from './descriptive/Orbit';



export class DescriptiveOrbitalSystem extends AnimatedSpaceObjectsGroup{
  constructor(centerData, orbitersData, orbitClass, OrbiterArtistClass){
    super(new THREE.Group())
    const self = this
    this.dict= {}
    this.center = {
      data: centerData
    }
    this.dict[centerData.name] = this.center
    this.orbiters = orbitersData.map(od=>{
      const o = {
        data: od
      }
      o.artist = OrbiterArtistClass.fromData(od)
      //o.object3d = o.artist.object3d
      o.orbit = orbitClass.fromOrbiterData(od, self.center.data)
      o.orbit.add(o.artist)
      //o.orbit.showPath()
      //addAxesHelper(o.artist.object3d)
      self.add(o.orbit)
      this.dict[od.name] = o
      return o
    })
    this.center.artist = OrbiterArtistClass.fromData(this.center.data)
    self.add(this.center.artist)
  }
  
  /** */
  initAnimation(newDate){
    this.center.artist.initAnimation(newDate)
    this.orbiters.forEach(o=>{
      o.artist.initAnimation(newDate)
      o.orbit.initAnimation(newDate)
    })
  }
  /** does nothing */
  animate(msecSimulTimestamp){
    this.center.artist.animate(msecSimulTimestamp)
    this.orbiters.forEach(o=>{
      o.artist.animate(msecSimulTimestamp)
      o.orbit.animate(msecSimulTimestamp)
    })
  }
}

export class KeplerOrbitalSystem extends DescriptiveOrbitalSystem{
  constructor(centerData, orbitersData, OrbiterArtistClass){
    super(centerData, orbitersData, KeplerOrbit, OrbiterArtistClass)
  }
}
export class CircularOrbitalSystem extends DescriptiveOrbitalSystem{
  constructor(centerData, orbitersData, OrbiterArtistClass){
    super(centerData, orbitersData, CircularOrbit, OrbiterArtistClass)
  }
}