import * as THREE from 'three'

import { AnimatedSpaceObjectsGroup } from "../core/SpaceObject";



export class DescriptiveOrbitalSystem extends AnimatedSpaceObjectsGroup{
  constructor(centerData, orbitersData, orbitClass, OrbiterArtistClass){
    super(new THREE.Group())
    const self = this
    this.bodies= {}
    this.center = {
      data: centerData
    }
    this.bodies[centerData.name] = this.center
    this.orbiters = orbitersData.map(od=>{
      const o = {
        data: od
      }
      o.artist = OrbiterArtistClass.fromData(od)
      //o.object3d = o.artist.object3d
      o.orbit = orbitClass.fromData(od, self.center.data)
      o.orbit.add(o.artist)
      //o.orbit.showPath()
      //addAxesHelper(o.artist.object3d)
      self.add(o.orbit)
      this.bodies[od.name] = o
      return o
    })
    this.center.artist = OrbiterArtistClass.fromData(this.center.data)
    self.add(this.center.artist)
  }
}
