import * as THREE from 'three'

import { AnimatedSpaceObjectsGroup } from "./SpaceObject";
import { KeplerOrbit, CircularOrbit } from './descriptive/Orbit';



export class DescriptiveOrbitalSystem extends AnimatedSpaceObjectsGroup{
  constructor(centerData, orbitersData, orbitClass, OrbiterArtistClass){
    super(new THREE.Group())
    const self = this
    this.center = centerData
    this.orbiters = orbitersData
    this.orbiters.forEach(o=>{
      o.artist = OrbiterArtistClass.fromData(o)
      o.object3d = o.artist.object3d
      o.orbit = orbitClass.fromOrbiterData(o, self.center)
      o.orbit.showPath()
      //addAxesHelper(o.artist.object3d)
      self.add(o.orbit)
    })
    this.center.artist = OrbiterArtistClass.fromData(this.center)
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