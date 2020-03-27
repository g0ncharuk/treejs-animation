import './styles/style.scss';
import 'bootstrap';

import * as THREE from 'three';


let renderer: THREE.WebGLRenderer = null;
let scene: THREE.Scene = null;
let camera: THREE.PerspectiveCamera = null;
let objects: Array<any> = [];
let container = document.getElementById('paper');
let width = container.clientWidth, height = container.clientHeight;
var clock = new THREE.Clock();
var lineMat: THREE.ShaderMaterial = null;
var time = 0;

init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera(75, width / height, 1, 200);
    camera.position.z = 150;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x191919);
    scene.fog = new THREE.Fog(0x111111, 150, 200);

    var lineSegments = lineGeometry();

    objects.push(lineSegments);
    scene.add(lineSegments);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    container.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);

}

function lineGeometry() {
    var points = [];
    points.push(new THREE.Vector3(0, 0, 0));
    points.push(new THREE.Vector3(0, -15, 0));

    points.push(new THREE.Vector3(0, -15, 0));
    points.push(new THREE.Vector3(45, -15, 0));

    points.push(new THREE.Vector3(45, -15, 0));
    points.push(new THREE.Vector3(45, -100, 0));

    points.push(new THREE.Vector3(45, -100, 0));
    points.push(new THREE.Vector3(60, -100, 0));

    points.push(new THREE.Vector3(60, -100, 0));
    points.push(new THREE.Vector3(60, -15, 0));

    points.push(new THREE.Vector3(60, -15, 0));
    points.push(new THREE.Vector3(105, -15, 0));

    points.push(new THREE.Vector3(105, -15, 0));
    points.push(new THREE.Vector3(105, 0, 0));

    points.push(new THREE.Vector3(105, 0, 0));
    points.push(new THREE.Vector3(0, 0, 0));

    var lineDistances = [];
    var d = 0;
    for (let i = 0; i < points.length; i++) {
      if (i > 0) {
        d += points[i].distanceTo(points[i - 1]);
      }
      lineDistances[i] = d;
    }
    
    var lineGeom = new THREE.BufferGeometry().setFromPoints(points);
    lineGeom.addAttribute('lineDistance', new THREE.BufferAttribute(new Float32Array(lineDistances), 1));
    lineMat = new THREE.ShaderMaterial({
      uniforms: {
        diffuse: {value: new THREE.Color(0x4babe7)},
        dashSize: {value: 35},
        gapSize: {value: 35},
        opacity: {value: 1.0},
        time: {value: 0}
      },
      vertexShader: lineVertShader(),
      fragmentShader: lineFragShader(),
      transparent: true
    });

    return new THREE.Line(lineGeom, lineMat);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    time += clock.getDelta();
    lineMat.uniforms.time.value = time;
    renderer.render(scene, camera);

}

 function lineVertShader() {
    return `
    attribute float lineDistance;
    varying float vLineDistance;
    
    void main() {
      vLineDistance = lineDistance;
      vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
      gl_Position = projectionMatrix * mvPosition;
    }
    `
}

function lineFragShader() {
    return `
    uniform vec3 diffuse;
    uniform float opacity;
    uniform float time; // added time uniform
  
    uniform float dashSize;
    uniform float gapSize;
    varying float vLineDistance;
    
    void main() {
      float totalSize = dashSize + gapSize;
      float modulo = mod( vLineDistance + time * 15.0 , totalSize ); 
      
      if ( modulo > dashSize) {
        discard;
      }
  
      gl_FragColor = vec4( diffuse, opacity );
    }
    `
}