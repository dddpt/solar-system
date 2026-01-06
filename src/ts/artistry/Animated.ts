import * as THREE from 'three'
import { Msec } from '../core/spatialUnits'
import { EventListener3D } from '../events/EventListener3D'
import { EventManager3D } from '../events/EventManager3D'

/** Animated: has 2 methods relevant for three.js animation: initAnimation() and animate()
 */
export abstract class Animated{
  _type: string = "Animated"
  /**ABSTRACT initAnimation() prepares the animation for a given date*/
  abstract initAnimation(newDate: Date): void;

  /**ABSTRACT animate() animates the object for the given secSimulTimestamp*/
  abstract animate(msecSimulTimestamp: Msec): void;

}

/** Drawable: simply an object having an three.js object3d property
 * 
 */
export abstract class Artist extends Animated{
  _type = "Artist"
  object3d: THREE.Object3D
  constructor(object3d: THREE.Object3D){
    super()
    this.object3d=object3d
    this.object3d.userData.relatedArtist = this
    this.object3d.userData.eventListeners = []
  }

  add3dEventListener(eventListener: EventListener3D, listenerId?: string): [a: Artist, listenerId: string]{
    const eventManager = EventManager3D.get()
    if(!listenerId){
      // eventListener should be added only once to the global EventManager singleton
      listenerId = eventManager._add3DEventListener(eventListener, this)
    }
    this.object3d.userData.eventListeners.push(listenerId)
    return [this, listenerId]
  }

  remove3dEventListener(eventListener: EventListener3D, listenerId?: string): string{
    const eventManager = EventManager3D.get()
    if(!listenerId){
      // eventListener should be added only once to the global EventManager singleton
      listenerId = eventManager._remove3DEventListener(eventListener, this)
    }
    this.object3d.userData.eventListeners = this.object3d.userData.eventListeners.filter((id: string) => id!=listenerId)
    return listenerId
 }
}

/** ArtistsGroup: an Artist made of children Artists
 * 
 * takes care of propagating animate() and initAnimation() to children
 */
export class ArtistsGroup extends Artist{
  _type = "ArtistsGroup"
  mobile: THREE.Object3D
  children: Artist[]
  constructor(){
    super(new THREE.Group())
    this.mobile = new THREE.Group()
    this.object3d.add(this.mobile)
    this.children = []
    this.mobile.userData.relatedArtist = this
    this.mobile.userData.isMobile = true
  }
  
  /** */
  initAnimation(newDate: Date){
    this.children.forEach(o=>{
      o.initAnimation(newDate)
    })
  }
  /** does nothing */
  animate(msecTimestamp: Msec){
    this.children.forEach(o=>{
      o.animate(msecTimestamp)
    })
  }

  /** */
  add(...children: Artist[]){
    const self = this
    children = children.filter(o=>!self.children.includes(o))
    this.children = this.children.concat(children)
    children.forEach(o=>{
      self.mobile.add(o.object3d)      
    })
  }
  /** */
  remove(...children: Artist[]){
    const self = this
    this.children = this.children.filter(o=>!children.includes(o))
    children.forEach(o=>{
      self.mobile.remove(o.object3d)
    })
  }

  add3dEventListener(eventListener: EventListener3D, listenerId?: string): [a: ArtistsGroup, listenerId: string]{
    listenerId = super.add3dEventListener(eventListener, listenerId)[1]
    if(eventListener.recursive){
      this.children.forEach(a=>a.add3dEventListener(eventListener, listenerId))
    }
    return [this, listenerId]
  }

  remove3dEventListener(eventListener: EventListener3D, listenerId?: string): string{
    listenerId = super.remove3dEventListener(eventListener, listenerId)
    if(eventListener.recursive){
      this.children.forEach(a=>a.remove3dEventListener(eventListener, listenerId))
    }
    return listenerId
  }
}


export interface ArtistObject3dUserData{
  relatedArtist: Artist;
  eventListeners: string[]
}