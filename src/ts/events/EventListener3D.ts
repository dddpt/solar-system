import { Artist } from "../artistry/Animated"

export abstract class EventListener3D{
  id: string
  recursive: boolean
  listensHover: boolean
  listensClick: boolean
  constructor(id: string, recursive: boolean, listensHover: boolean, listensClick: boolean){
    this.id = id
    this.recursive = recursive
    this.listensHover = listensHover
    this.listensClick = listensClick
  }
  abstract onClick(intersects: THREE.Intersection[], listenedArtist: Artist, event: PointerEvent, allIntersects: THREE.Intersection []): void;
  abstract onHover(intersects: THREE.Intersection[], listenedArtist: Artist, event: PointerEvent, allIntersects: THREE.Intersection []): void;
}



export class SimpleEventListener3D extends EventListener3D{
  onHoverFunc?:(i: THREE.Intersection[], la: Artist, e: PointerEvent, ai: THREE.Intersection[])=>any;
  onClickFunc?:(i: THREE.Intersection[], la: Artist, e: PointerEvent, ai: THREE.Intersection[])=>any;
  constructor(
    id: string,
    onHover?:(i: THREE.Intersection[], la: Artist, e: PointerEvent, ai: THREE.Intersection[])=>any,
    onClick?:(i: THREE.Intersection[], la: Artist, e: PointerEvent, ai: THREE.Intersection[])=>any,
    recursive: boolean = true
  ){
    super(id, recursive, onHover!==undefined, onClick!==undefined)
    this.onHoverFunc = onHover
    this.onClickFunc = onClick
  }
  onClick(intersects: THREE.Intersection[], listenedArtist: Artist, event: PointerEvent, allIntersects: THREE.Intersection[]): void {
    this.onClickFunc(intersects, listenedArtist, event, allIntersects)
  }
  onHover(intersects: THREE.Intersection[], listenedArtist: Artist, event: PointerEvent, allIntersects: THREE.Intersection[]): void {
    this.onHoverFunc(intersects, listenedArtist, event, allIntersects)
  }
}