import * as THREE from "three";
import { EventListener3D } from "./EventListener3D";
import { Animated, Artist, ArtistObject3dUserData } from "../artistry/Animated";
import { Msec } from "../core/spatialUnits";
import { tconsole } from "../utils";

/** Global EventManager3D singleton */
let eventManagerSingleton: EventManager3D;

export const CLICK_EVENT_3D = "click3d"
export const HOVER_EVENT_3D = "hover3d"
export const POINTER_EVENTS_3D = [CLICK_EVENT_3D, HOVER_EVENT_3D]
export type PointerEvent3D = "click3d" | "hover3d"


/** Global EventManager3D singleton class
 * 
 * Should be initialized using EventManager3D.initialize(camera, canvas)
 * Afterward, shouldn't be touched.
 * Is implicitly used by Artist.add3DEventListener()
 */
export class EventManager3D{
  canvas: HTMLCanvasElement
  camera: THREE.Camera
  eventListeners: Map<string, [el: EventListener3D, a: Artist]>
  raycaster: THREE.Raycaster;  
  pointer: THREE.Vector2;
  constructor(camera: THREE.Camera, canvas: HTMLCanvasElement){
    if(eventManagerSingleton){
      throw "EventManager3D.constructor(): trying to create multiple EventManager3D. "+
      "EventManager3D is a singleton. use EventManager3D.get()";
    }
    this.canvas=canvas
    this.camera=camera
    this.eventListeners = new Map<string, [el: EventListener3D, a: Artist]>();
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    document.addEventListener( 'pointermove', e => this.onPointerMove(e) );
    this.canvas.addEventListener("click", e=>this.onClick(e))

    eventManagerSingleton = this
  }

  static getIdForEventListenerArtist(eventListener: EventListener3D, artist: Artist){
    return eventListener.id+"-"+artist.object3d.uuid
  }

  /** adds a 3D event Listener
   * 
   * Should only be called by Artist.add3DEventListener()
   */
  _add3DEventListener(eventListener: EventListener3D, artist: Artist): string{
    const id = EventManager3D.getIdForEventListenerArtist(eventListener, artist)
    if(!this.eventListeners.has(id)){
      console.log("ADDING 3D EVENT LISTENER id:", id)
      this.eventListeners.set(id, [eventListener, artist])
    }
    return id
  }

  /** removes a 3D event Listener
   * 
   * Should only be called by Artist.remove3DEventListener()
   */
  _remove3DEventListener(eventListener: EventListener3D, artist: Artist): string{
    const id = EventManager3D.getIdForEventListenerArtist(eventListener, artist)
    if(this.eventListeners.has(id)){
      this.eventListeners.delete(id)
    }
    return id
  }

  updatePointer( event: PointerEvent ) {
    // This only works with fullscreen three.js scenes
    // TODO: take into account non-fullscreen three.js scenes.
    this.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    // raycasting/intersects
    this.raycaster.setFromCamera( this.pointer, this.camera );
  }

  onPointerMove( event: PointerEvent ) {
    this.updatePointer(event)
    this.triggerIntersects(HOVER_EVENT_3D, event)
  }

  onClick(event: PointerEvent){
    tconsole.log("EM3D.onClickkkkkk()")
    this.triggerIntersects(CLICK_EVENT_3D, event)
  }

  triggerIntersects(eventType: PointerEvent3D, event: PointerEvent){
    for(let [el, a] of this.eventListeners.values()){
      if(eventType==CLICK_EVENT_3D && el.listensClick){
        this.triggerEventListener(eventType, el, a, event)
      }
      if(eventType==HOVER_EVENT_3D && el.listensHover){
        this.triggerEventListener(eventType, el, a, event)
      }
    }
  }

  // handle intersects
  triggerEventListener(eventType: PointerEvent3D, eventListener: EventListener3D, artist: Artist, event: PointerEvent){
    
    tconsole.log("EM3D.triggerEventListener() eventType "+eventType)
    const id = EventManager3D.getIdForEventListenerArtist(eventListener, artist)
    // recursive is always true here, as 
    // only objects with the explicit "eventListeners" userData will be selected
    const allIntersects = this.raycaster.intersectObject( artist.object3d, true );
    //tconsole.log("ti() original intersects.length", allIntersects.length, "intersects", allIntersects)
    const filteredIntersects = allIntersects.filter(i=>{
      const userData = i.object.userData as ArtistObject3dUserData
      return userData?.eventListeners?.includes(id)
    }) 
    //tconsole.log("ti() filtered intersects.length", filteredIntersects.length, "intersects", filteredIntersects)
    
    if(eventType==CLICK_EVENT_3D && filteredIntersects.length>0){
      eventListener.onClick(filteredIntersects, artist, event, allIntersects)
    }    
    if(eventType==HOVER_EVENT_3D && filteredIntersects.length>0){
      eventListener.onHover(filteredIntersects, artist, event, allIntersects)
    }
  }

  static get(): EventManager3D{
    if(!eventManagerSingleton){
      throw "EventManager3D.get(): trying to get EventManager3D singleton"+
      " before it was instantiated with EventManager3D.createSingleton(scene)."
    }
    return eventManagerSingleton
  }


  static initialize(camera: THREE.Camera, canvas: HTMLCanvasElement): EventManager3D{
    if(!eventManagerSingleton){
      // create singleton
      new EventManager3D(camera, canvas)
    }
    return eventManagerSingleton
  }
}

class EventManager3DSingleton extends EventManager3D{
}