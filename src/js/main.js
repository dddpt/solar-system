import * as THREE from 'three'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"

import {config} from "./config.js"
import { CircularOrbit, EllipticOrbit, KeplerOrbit } from './descriptive/Orbit.js'
import { KeplerOrbitalSystem } from './descriptive/KeplerOrbitalSystem.js'
import { EclipticOrthogonalsOrbitArtist } from './descriptive/OrbitArtist.js'
import { ColoredSphere } from "./PlanetArtist.js";
import {planets, sun, mercury, earth, pluto, astronomicalBodies, epochs, jupiter} from "./data/SolarSystemData.js"
import {yr, msec, sec, km, time, units} from "./core/spatialUnits.js"
import {addAxesHelper, resizeRendererToDisplaySize, ellipse} from "./utils.js"
import { NewtonianBody, AnimatedNewtonianBody } from './newtonian/NewtonianBody.js'
import { AnimatedGravitationalSystem } from './newtonian/GravitationalSystem.js'
 
// create scene, camera and renderer
const scene = new THREE.Scene();

//create renderer
const canvas = document.querySelector('#threejs_canvas');
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
let cameraLSposition = localStorage.getItem("camera-position")
if(cameraLSposition){
  cameraLSposition = JSON.parse(cameraLSposition)
  camera.position.x = cameraLSposition.x
  camera.position.y = cameraLSposition.y
  camera.position.z = cameraLSposition.z
}else{
  resetCameraPosition()
}

//create light source
const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-1, 2, 20);
scene.add(light);

// create ColoredSphere, orbit and tiltedPlane for each planet&sun
const nb1 = new NewtonianBody(sun.mass, new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0))
const nb2 = new NewtonianBody(earth.mass, new THREE.Vector3(1,0,0), new THREE.Vector3(0,0,-2e-10))
const pa1 = new ColoredSphere(earth.meanRadius*3,"yellow")
const pa2 = new ColoredSphere(earth.meanRadius,"red")
const anb1 = new AnimatedNewtonianBody(nb1)
const anb2 = new AnimatedNewtonianBody(nb2)
anb1.add(pa1)
anb2.add(pa2)
const ags = new AnimatedGravitationalSystem(epochs.J2000, [anb1, anb2])
window.nb1=nb1
window.nb1=nb2
window.anb1=nb1
window.anb1=nb2
window.pa1=pa1
window.pa2=pa2


// Initialize orbital system
ags.initAnimation(epochs.J2000)
scene.add(ags.object3d)
/*console.log("planets.map(p=>p.artist.object3d.position.x)")
console.log(planets.map(p=>p.artist.object3d.position.x))*/

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
addAxesHelper(pa1.object3d)
addAxesHelper(pa2.object3d)

console.log("launching...")
// END DEBUGGING

// animate!!
let lastPrintTS = 0
let maxSimulTimestampReached = false
let lastTimestamp = false
let currentSimulTimestamp = +epochs.J2000
function animate(timestamp) {
  //timestamp is a milliseconds timestamp since beginning of the animation, differences between 2 timestamps: usually around 16.66 milliseconds (60fps)
  if(timestamp>config.maxSimulTimestamp && !maxSimulTimestampReached){
    timestamp = config.maxSimulTimestamp
    maxSimulTimestampReached = true
    console.log("timestamp>maxSimulTimestamp!!")
  }
  if(timestamp<=config.maxSimulTimestamp){
    const deltaT = (timestamp-lastTimestamp)
    const simulDeltaT = deltaT * config.simulSecPerRealSec
    currentSimulTimestamp += simulDeltaT
    console.log("nb1.position: ",nb1.position)
    ags.animate(currentSimulTimestamp)
    if((timestamp>lastPrintTS+config.debugLogInterval) || maxSimulTimestampReached){
      lastPrintTS=timestamp
    }
  }
  updateCameraLS(timestamp)
  resizeRendererToDisplaySize(renderer, camera)
  renderer.render( scene, camera );
  requestAnimationFrame( animate );
  lastTimestamp = timestamp
}
requestAnimationFrame( animate );

window.planets = planets
planets.forEach(p=>window[p.name.toLowerCase()] = p)
window.ags = ags
window.scene = scene
window.sun = sun
window.yr = yr
window.km = km
window.msec = msec
window.resetCameraPosition = resetCameraPosition
window.astronomicalBodies = astronomicalBodies
window.THREE = THREE
window.addAxesHelper = addAxesHelper
window.units = units