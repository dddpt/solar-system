class A{
  x
  constructor(xv){
    this.x=xv
  }
  doStuff(){
    console.log("A.doStuff(), x="+this.x)
  }
  doThings(){
    this.doStuff()
    console.log("A.doThings(), x="+this.x)

  }
}

class B extends A{
  y
  constructor(xv, yv){
    super(xv)
    this.y=yv
  }
  doStuff(){
    console.log("B.doStuff(), x="+this.x+", y="+this.y)
  }
}

a = new A(1)

b = new B(2,3)

a.doThings()
b.doThings()