import * as THREE from 'three'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"

import {config} from "./config"
import { AbstractOrbit, CircularOrbit, EllipticOrbit, KeplerOrbit } from './descriptive/Orbit'
import { KeplerOrbitalSystem } from './descriptive/KeplerOrbitalSystem'
import { ColoredSphere } from "./artistry/PlanetArtist";
import {planets, sun, mercury, earth, pluto, astronomicalBodies, epochs, jupiter, SpatialObjectData, sunAndPlanets} from "./data/SolarSystemData"
import {yr, msec, sec, km, time, units, month} from "./core/spatialUnits"
import {addAxesHelper, resizeRendererToDisplaySize, tconsole} from "./utils"
//import { NewtonianBody, AnimatedNewtonianBody } from './newtonian/NewtonianBody'
//import { AnimatedGravitationalSystem } from './newtonian/GravitationalSystem'
//import { OrbitalSystemHierarchicalArtist } from './artistry/OrbitalSystemHierarchicalArtist'
import { EclipticOrthogonalsOrbitArtist, TraceAndOrthogonalsOrbitArtist } from './artistry/EclipticOrthogonalsOrbitArtist'
import { Artist, ArtistsGroup } from './artistry/Animated'
import { OrbitalSystemArtist } from './artistry/OrbitalSystemArtist'
import { OrbiterArtist } from './artistry/OrbiterArtist'
import { OrbitalSystem } from './core/OrbitalSystem'
import { SpaceObject, SpatialObjectState } from './core/SpaceObject'
import { NewtonianBody } from './newtonian/NewtonianBody'
import { GravitationalSystem } from './newtonian/GravitationalSystem'
import { OrthogonalArtist, VectorArtist } from './artistry/VectorArtist'
import { OrbitStepsArtist } from './artistry/OrbitStepsArtist'
import { EventManager3D } from './events/EventManager3D'
import { SimpleEventListener3D } from './events/EventListener3D'
 
// create scene, camera and renderer
const scene = new THREE.Scene();

//create renderer
const canvas = document.querySelector('#threejs_canvas') as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({canvas});

//create camera with controls
const fov = 75;
const aspectRatio =  canvas.clientWidth / canvas.clientHeight;
const near = 0.01;
const far = 1000;
const camera = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);
const controls = new OrbitControls(camera, canvas);
controls.update();
//camera position localStorage 
const intervalCameraLSupdate = 1000
let lastCameraLSupdate = 0
function updateCameraLS(timestamp){
  if(timestamp-lastCameraLSupdate>intervalCameraLSupdate){
    localStorage.setItem("camera-position", JSON.stringify(camera.position))
    lastCameraLSupdate = timestamp
  }
  camera.lookAt(0,0,0)
}
function resetCameraPosition(){
  camera.position.x = 0;
  camera.position.y = 6;
  camera.position.z = 8;
  camera.lookAt(0,0,0)
}
const cameraLSposition = localStorage.getItem("camera-position")
if(cameraLSposition){
  const cameraLSpositionv:THREE.Vector3 = JSON.parse(cameraLSposition)
  camera.position.x = cameraLSpositionv.x
  camera.position.y = cameraLSpositionv.y
  camera.position.z = cameraLSpositionv.z
}else{
  resetCameraPosition()
}

//create light source
const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-1, 2, 20);
scene.add(light);

/* handle window resize */

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}
onWindowResize()
window.addEventListener( 'resize', onWindowResize );

/* EventManager3D */

EventManager3D.initialize(camera, canvas)

/* Vector Artist test */

const va = new VectorArtist(new THREE.Vector3(1,1, 0), undefined, {color: 0xff2222}, 1)
scene.add(va.object3d)
const orthog = new OrthogonalArtist(new THREE.Vector3(1,1, 0),  {color: 0x22ff22})
scene.add(orthog.object3d)

/* Fin Vector Artist test */


// create text div for date
let text2 = document.createElement('div');
text2.style.position = 'absolute';
//text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
text2.style.width = `${100}`;
text2.style.height = `${100}`;
//text2.style.backgroundColor = "blue";
text2.style.color = "white";
text2.innerHTML = "hi there!";
text2.style.top = 0 + 'px';
text2.style.left = 0 + 'px';
document.body.appendChild(text2);

//KeplerOrbitalSystem
const kos = KeplerOrbitalSystem.fromData(sunAndPlanets)
kos.initialize()
//kos.center.artist.object3d.scale.set(60, 60, 60)
//kos.initAnimation(epochs.J2000)

const orbitStepsLogger = new SimpleEventListener3D("osa-log",
    (i: THREE.Intersection[], a: Artist, e: PointerEvent, ai: THREE.Intersection[])=>{
      const intersection = i[0]
      const state = intersection?.object?.userData.state as SpatialObjectState
      console.log("HOVER OrbitStepsArtist: ", a, "s: ", state, "intersection", intersection)
      console.log("     s: ", state)
      console.log("     intersection:", intersection)
      console.log("     intersections:", i.length)
    },
    (i: THREE.Intersection[], a: Artist, e: PointerEvent, ai: THREE.Intersection[])=>{
      const intersection = i[0]
      const state = intersection?.object?.userData.state as SpatialObjectState
      console.log("CLICK OrbitStepsArtist: ", a, "s: ", state, "intersection", intersection)
      console.log("     s: ", state)
      console.log("     intersection:", intersection)
      console.log("     intersections:", i.length)
    },
    true
  )

console.log("creating KeplerOrbitalSystem artist")
const localArtistsFromOrbit: (
  system: OrbitalSystem<SpatialObjectState,SpaceObject<SpatialObjectState>>,
  o: SpaceObject<SpatialObjectState>
)=>Artist[] = (s,o)=> [
  new ColoredSphere(o.data.meanRadius, o.data.color)
]
const globalArtistsFromOrbit: (
  system: OrbitalSystem<SpatialObjectState,SpaceObject<SpatialObjectState>>,
  o: AbstractOrbit<SpatialObjectState> | NewtonianBody,
)=>Artist[] = (s,o) => [
  TraceAndOrthogonalsOrbitArtist.fullOrbit(s,o, 0x0000ff, 128, 128),
  (()=>{
    const startingSphere = new ColoredSphere(o.data.meanRadius/2,  0xffffff)
    const initState = o.getInitialState()
    startingSphere.object3d.position.x = initState.position.x
    startingSphere.object3d.position.y = initState.position.y
    startingSphere.object3d.position.z = initState.position.z
    return startingSphere
  })(),
  (OrbitStepsArtist.fullOrbit(s,o, 3000*km, 0x0000ff, 128).add3dEventListener(orbitStepsLogger)[0])
]
const artistFromNonOrbitData: (
  system, d: SpatialObjectData
)=>Artist[] = (s,d) => [
  new ColoredSphere(d.meanRadius, d.color, 60)
]

const kosartist = new OrbitalSystemArtist(
  kos,
  artistFromNonOrbitData,
  localArtistsFromOrbit,
  globalArtistsFromOrbit
)
kosartist.initAnimation(epochs.J2000)
scene.add(kosartist.object3d)

const sunArtist = kosartist.artists.get("Sun")

// create ColoredSphere, & gravitational system
const gs = GravitationalSystem.fromData([sun, earth, pluto])//(sunAndPlanets)//
console.log("MAIN.ts gs: ", gs)


console.log("creating GravitationalSystem artist")
const from = +epochs.J2000
const to = from+100*yr
const nbSteps = 600

const localArtistsFromOrbit2 = (s,o)=> o.data.id=="Earth"? [new ColoredSphere(o.data.meanRadius, 0xcccccc)] : []
const globalArtistsFromOrbit2 = (s,o) => [
  TraceAndOrthogonalsOrbitArtist.fromTo(s,o, from, to, 0x880000, 6000, 600),
  (OrbitStepsArtist.fromTo(s,o, from, to, 3000*km, 0xbb0000, 600).add3dEventListener(orbitStepsLogger)[0])
]
const gsartist = new OrbitalSystemArtist(
  gs,
  ()=>[],
  localArtistsFromOrbit2,
  globalArtistsFromOrbit2
)
gsartist.initAnimation(epochs.J2000)
console.log("EARTH INITIAL STATE ", gs.getBody("Earth").initialState.clone())
scene.add(gsartist.object3d)


//@ts-ignore
window.gs=gs
//@ts-ignore
window.gsartist=gsartist

// DEBUGGING: central axes helper
//mercury.kepler.debug=true
/*let du = new THREE.Object3D()
du.position.x = 1
addAxesHelper(du)
scene.add(du)
let da = new THREE.Object3D()
da.position.x = 1
da.rotateY(Math.PI/4)
//da.rotateX(Math.PI/8)
//da.rotateY(Math.PI/4)
//da.rotateY(-Math.PI/4)
console.log("du.position 1:", du.position)
du.position.applyQuaternion(da.quaternion)
console.log("du.position 2:", du.position)
addAxesHelper(da)
scene.add(da)
window.da = da
window.du = du
/*let di = new THREE.Object3D()
di.rotateY(Math.PI/4)
addAxesHelper(di)
scene.add(di)*/

//addAxesHelper(pluto.orbit.object3d)
//addAxesHelper(pluto.orbit.orbit.object3d)
//addAxesHelper(earth.artist.object3d)
//addAxesHelper(jupiter.orbit.object3d)
//addAxesHelper(pa1.object3d)
//addAxesHelper(pa2.object3d)
//addAxesHelper((kos.bodies["Earth"] as DescriptiveOrbitalSystemOrbiter).orbit.mobile)

console.log("launching...")
// END DEBUGGING





// animate!!
let lastPrintTS = 0
let maxAnimationDurationReached = false
let lastTimestamp = 0
let currentSimulTimestamp = +epochs.J2000
let animCount = 0
function animate(animationTimestamp:number) {
  animCount++
  //animationTimestamp is a milliseconds timestamp since beginning of the animation, differences between 2 timestamps: usually around 16.66 milliseconds (60fps)
  if(animationTimestamp>config.maxAnimationDuration && !maxAnimationDurationReached){
    animationTimestamp = config.maxAnimationDuration
    maxAnimationDurationReached = true
    console.log("animationTimestamp>maxAnimationDuration!!")
  }
  if(animationTimestamp<=config.maxAnimationDuration && animCount<=1000000000000){
    const deltaT = (animationTimestamp-lastTimestamp)
    const simulDeltaT = deltaT * config.simulSecPerRealSec
    currentSimulTimestamp += simulDeltaT
    //ags.animate(currentSimulTimestamp)
    kosartist.animate(currentSimulTimestamp)
    gsartist.animate(currentSimulTimestamp)
    if((animationTimestamp>lastPrintTS+config.debugLogInterval) || maxAnimationDurationReached){
      lastPrintTS=animationTimestamp
      text2.innerHTML = ""+new Date(currentSimulTimestamp)
    }
    if((animationTimestamp%config.textUpdateInterval)<30 || maxAnimationDurationReached){
      lastPrintTS=animationTimestamp
      text2.innerHTML = new Date(currentSimulTimestamp) + (maxAnimationDurationReached? "":"<br>framerate NEWTON NEWTON NEWTON:"+Math.round(1000/deltaT))
    }

    // DEBUGGING
    const kosartisto3d = kosartist.object3d

    //const earthGlobalArtist = kosartist.artists.get("Earth")[0]
    //tconsole.log("earthGlobalArtist object3d _type", earthGlobalArtist._type, "earthGlobalArtist: ", earthGlobalArtist)
    //tconsole.log("earthGlobalArtist object3d position", earthGlobalArtist.object3d.position)
    //@ts-ignore
    //tconsole.log("earthGlobalArtist mobile position", earthGlobalArtist?.mobile?.position)

    //const earthlocalArtist = kosartist.artists.get("Earth")
    //tconsole.log("earthlocalArtist object3d _type", earthlocalArtist._type, "earthlocalArtist: ", earthlocalArtist)
    //tconsole.log("earthlocalArtist object3d position", earthlocalArtist.object3d.position)
    //tconsole.log("earthlocalArtist mobile position", earthlocalArtist.mobile.position)
    // END DEBUGGING
  }


  updateCameraLS(animationTimestamp)
  resizeRendererToDisplaySize(renderer, camera)
  renderer.render( scene, camera );

  // finding the intersects:
  //gsartist.children[1].children[2].children[0].object3d.userData

  requestAnimationFrame( animate );
  lastTimestamp = animationTimestamp
}
requestAnimationFrame( animate );

//@ts-ignore
window.planets = planets
planets.forEach(p=>window[p.id.toLowerCase()] = p)
//@ts-ignore
window.kos = kos
//@ts-ignore
window.kosartist = kosartist
//@ts-ignore
window.kearth = kos.bodies["Earth"]
//@ts-ignore
//window.ags = ags
//@ts-ignore
window.scene = scene
//@ts-ignore
window.sun = sun
//@ts-ignore
window.sunArtist = sunArtist
//@ts-ignore
//window.nbearth = nb2
//@ts-ignore
window.yr = yr
//@ts-ignore
window.km = km
//@ts-ignore
window.msec = msec
//@ts-ignore
window.resetCameraPosition = resetCameraPosition
//@ts-ignore
window.astronomicalBodies = astronomicalBodies
//@ts-ignore
window.THREE = THREE
//@ts-ignore
window.addAxesHelper = addAxesHelper
//@ts-ignore
window.units = units
//@ts-ignore
window.config=config