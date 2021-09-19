

/** Animated: has 2 methods relevant for three.js animation: initAnimation() and animate()
 */
export class Animated{
  constructor(){
  }
  /**ABSTRACT initAnimation() prepares the animation for a given date*/
  initAnimation(newDate){
    throw "Animated.initAnimation(): abstract method called"
  }

  /**ABSTRACT animate() animates the object for the given secSimulTimestamp*/
  animate(secSimulTimestamp){
    throw "Animated.animate(): abstract method called"
  }
}

/** AnimatedSpaceObject: simply an object having an three.js object3d property
 * 
 * extends Animated
 */
export class AnimatedSpaceObject extends Animated{
  constructor(object3d){
    super()
    this.object3d = object3d
  }
}

/** AnimatedSpaceObjectsGroup: an AnimatedSpaceObject with children AnimatedSpaceObject
 * 
 * takes care of propagating animate() and initAnimation() to children
 */
export class AnimatedSpaceObjectsGroup extends AnimatedSpaceObject{
  constructor(object3d){
    super(object3d)
    this.mobile = object3d // by default: no mobile and hence this.mobile = this.object3d
    this.children = []
  }
  
  /** */
  initAnimation(newDate){
    this.children.forEach(o=>{
      o.initAnimation(newDate)
    })
  }
  /** does nothing */
  animate(msecSimulTimestamp){
    this.children.forEach(o=>{
      o.animate(msecSimulTimestamp)
    })
  }

  /** */
  add(...children){
    const self = this
    children = children.filter(o=>!self.children.includes(o))
    this.children = this.children.concat(children)
    children.forEach(o=>{
      if (o.object3d){
        self.mobile.add(o.object3d)
      }
      else{
        throw "AnimatedSpaceObjectsGroup.add() missing object3d for: "+o.name
      }
    })
  }
  /** */
  remove(...children){
    const self = this
    this.children = this.children.filter(o=>!children.includes(o))
    children.forEach(o=>{
      self.mobile.remove(o.object3d)
    })
  }

}