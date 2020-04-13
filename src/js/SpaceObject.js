export class Animated{
  constructor(){
  }
  /**ABSTRACT */
  initAnimation(newDate){
    throw "Animated.initAnimation(): abstract method called"
  }

  /**ABSTRACT */
  animate(secSimulTimestamp){
    throw "Animated.animate(): abstract method called"
  }
}

export class AnimatedSpaceObject extends Animated{
  constructor(object3d){
    super()
    this.object3d = object3d
  }
}

export class AnimatedSpaceObjectsGroup extends AnimatedSpaceObject{
  constructor(object3d){
    super(object3d)
    this.mobile = object3d // by default: no mobile and hence this.mobile = this.object3d
    this.objects = []
  }
  /** */
  add(...objects){
    const self = this
    objects = objects.filter(o=>!self.objects.includes(o))
    this.objects = this.objects.concat(objects)
    objects.forEach(o=>{
      if (o.object3d){
        self.mobile.add(o.object3d)
      }
      else{
        throw "AnimatedSpaceObjectsGroup.add() missing object3d for: "+o.name
      }
    })
  }
  /** */
  remove(...objects){
    const self = this
    this.objects = this.objects.filter(o=>!objects.includes(o))
    objects.forEach(o=>{
      self.mobile.remove(o.object3d)
    })
  }

}