import * as THREE from 'three'
import * as _ from 'lodash'
 
 // create scene, camera and renderer
 let scene = new THREE.Scene();

//create renderer
const canvas = document.querySelector('#threejs_canvas');
const renderer = new THREE.WebGLRenderer({canvas});

//create camera
const fov = 75;
const aspectRatio =  canvas.clientWidth / canvas.clientHeight;
const near = 0.1;
const far = 1000;
const camera = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);
camera.position.z = 5;

//create light source
const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-1, 2, 4);
scene.add(light);

// create cube
const cubeGeometry = new THREE.BoxGeometry( 2, 2, 2 );
const cubeMaterial = new THREE.MeshPhongMaterial({color: 0x44aa88});
const cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
scene.add( cube );

// create sphere
const radius = 1;
const widthSegments = 50;
const heightSegments = 50;
const sphereGeometry = new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments)
const sphereMaterial = new THREE.MeshPhongMaterial({color: 0x455a88, emissive: 0x001111});
const sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
sphere.position.x=2
scene.add( sphere );


/** Responsive design: resizes the canvas upon window resize & handles camera aspect ratio*/
function resizeRendererToDisplaySize(renderer, camera) {
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

// animate!!
function animate(timestamp) {
  //timestamp is a milliseconds timestamp since beginning of the animation differences between 2 timestamps: usually around 16.66 milliseconds (60fps)
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render( scene, camera );
  resizeRendererToDisplaySize(renderer, camera)

  requestAnimationFrame( animate );
 }
 requestAnimationFrame( animate );
