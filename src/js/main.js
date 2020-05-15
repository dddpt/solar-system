import * as THREE from 'three'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"

import {config} from "./config.js"
import { CircularOrbit, EllipticOrbit, KeplerOrbit } from './descriptive/Orbit.js'
import { KeplerOrbitalSystem } from './descriptive/KeplerOrbitalSystem.js'
import { EclipticOrthogonalsOrbitArtist } from './descriptive/OrbitArtist.js'
import { ColoredSphere } from "./PlanetArtist.js";
import {planets, sun, mercury, earth, pluto, astronomicalBodies, epochs} from "./data/SolarSystemData.js"
import {yr, msec, sec, km, time, units} from "./core/spatialUnits.js"
import {addAxesHelper, resizeRendererToDisplaySize, ellipse} from "./utils.js"
 
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
const logSemiMajorAxis = semiMajorAxis => semiMajorAxis!=0 ? Math.log(10*semiMajorAxis) : 0
const kos = new KeplerOrbitalSystem(sun, planets, ColoredSphere)
kos.center.artist.object3d.scale.set(60, 60, 60)

// Initialize orbital system
kos.initAnimation(epochs.J2000)
scene.add(kos.object3d)
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

for(let p of kos.orbiters){
  let eclipt = new EclipticOrthogonalsOrbitArtist(p.orbit, p.data.orbitalPeriod/128,p.data.orbitalPeriod/128)
  scene.add(eclipt.object3d)
}

console.log("launching...")
// END DEBUGGING

// animate!!
let lastPrintTS = 0
let maxSimulTimestampReached = false
function animate(timestamp) {
  //timestamp is a milliseconds timestamp since beginning of the animation, differences between 2 timestamps: usually around 16.66 milliseconds (60fps)
  if(timestamp>config.maxSimulTimestamp && !maxSimulTimestampReached){
    timestamp = config.maxSimulTimestamp
    maxSimulTimestampReached = true
    console.log("timestamp>maxSimulTimestamp!!")
  }
  if(timestamp<=config.maxSimulTimestamp){
    const simulTimestamp = timestamp * config.simulSecPerRealSec
    kos.animate(simulTimestamp)
    if((timestamp>lastPrintTS+config.debugLogInterval) || maxSimulTimestampReached){
      //console.log("kos.dict.Earth.orbit.orbit.mobile.position: ",kos.dict.Earth.orbit.orbit.mobile.position)
      lastPrintTS=timestamp
    }
  }
  updateCameraLS(timestamp)
  resizeRendererToDisplaySize(renderer, camera)
  renderer.render( scene, camera );
  requestAnimationFrame( animate );
}
requestAnimationFrame( animate );

window.planets = planets
planets.forEach(p=>window[p.name.toLowerCase()] = p)
window.kos = kos
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