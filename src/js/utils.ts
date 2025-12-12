
import * as THREE from 'three'

/** Proper modulo (JS modulo doesn't handle negative values properly) */
export function mod(a, base){
  let mod = a % base
  return mod<0? mod+base : mod
}

/** addAxesHelper: adds visual axes at the center of the given object3d, very useful for initial testing*/
export function addAxesHelper(node){
  const axes = new THREE.AxesHelper();
  axes.material.depthTest = false;
  axes.renderOrder = 1;
  node.add(axes);
}

/** Responsive design: resizes the canvas upon window resize & handles camera aspect ratio*/
export function resizeRendererToDisplaySize(renderer, camera) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
  return needResize;
}

/** define an ellipse either with semiMajorAxis + eccentricity OR semiMajorAxis + semiMinorAxis
 * 
 * eccentricity takes precedence over semiMinorAxis (if eccentricity falsy, semiMinorAxis is used)
 */
export function ellipse(semiMajorAxis, eccentricity, semiMinorAxis=null){
  const a = semiMajorAxis
  const b = eccentricity? semiMajorAxis * Math.sqrt(1-eccentricity**2) : semiMinorAxis
  const e = {
    semiMajorAxis: a,
    semiMinorAxis: b,
    eccentricity: eccentricity? eccentricity : Math.sqrt(1-(semiMinorAxis/semiMajorAxis)**2)
  }
  const fociDist = Math.sqrt(a**2 - b**2)
  e.focus1 = new THREE.Vector2(fociDist, 0)
  e.focus2 = new THREE.Vector2(-fociDist, 0)
  e.curve = new THREE.EllipseCurve(0,0,a,b)
  const h = (a - b)**2 / (a + b)**2
  e.circumference = Math.PI * (a+b) * (1 + 3*h / (10 + Math.sqrt(4-3*h)))
  return e 
}

/** Computes the eccentric anomaly from the mean anomaly using Newton's method
 * 
 * based on https://en.wikipedia.org/wiki/Kepler%27s_equation#Numerical_approximation_of_inverse_problem
 */
export function eccentricAnomalyNewtonsMethod(radMeanAnomaly, eccentricity, tolerance=0.0000001, maxNbIteration=1000){
  if(eccentricity==1){
    throw "utils eccentricAnomalyNewtonsMethod(): not working for eccentricity=1"
  } else{
    const M = radMeanAnomaly
    const e = eccentricity
    let En = e>0.8? Math.PI : M
    let fEn = En - e * Math.sin(En) - M
    let i=0
    for (; Math.abs(fEn)>tolerance && i<maxNbIteration ; i++) {
      En = En - fEn / (1 - e*Math.cos(En))
      fEn = En - e * Math.sin(En) - M
    }
    //console.log("i=",i, "fEn=",fEn)
    return En
  }
}

/** Performs a binary search on f() from argMin to argMax so that abs(f(result)-target) < tolerance
 * 
 * f() is supposed to be monotonous growing between argMin and argMax
*/
export function binarySearch(f, argMin, argMax, target, tolerance=0.001, maxNbIteration=1000){
  let middle = argMin + (argMax-argMin)/2
  let diff = f(middle)-target
  let i=0
  for (; Math.abs(diff)>tolerance && i<maxNbIteration ; i++) {
    middle = argMin + (argMax-argMin)/2
    diff = f(middle)-target
    //console.log( "argMin: ", argMin, "argMax: ", argMax, "target: ", target, "tolerance: ",tolerance, "middle: ",middle,"diff: ",diff)
    if(diff>0){
      argMax = middle
    }else{
      argMin = middle
    }
  }
  return middle
}

export class ConsoleInterval{
  constructor(msecInterval){
    this.msecInterval = msecInterval
    this.timestamps = {}
  }
  log(msecTimestamp, ...stuffToLog){
    const logId = stuffToLog[0]
    //console.log("ConsoleInterval.log() msecTimestamp:", msecTimestamp, ", logId:", logId, ", stuffToLog: ",stuffToLog, ", this.timestamps: ",this.timestamps)
    //console.log("(!logId in this.timestamps): ", (!(logId in this.timestamps)))
    //console.log("(msecTimestamp>(this.timestamps[logId]+this.msecInterval)): ", (msecTimestamp>(this.timestamps[logId]+this.msecInterval)))
    if((!(logId in this.timestamps)) || (msecTimestamp>(this.timestamps[logId]+this.msecInterval))){
      console.log(...stuffToLog)
      this.timestamps[logId] = msecTimestamp
    }
  }
}