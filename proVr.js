import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.153.0/build/three.module.js';
import { XRControllerModelFactory } from 'https://cdn.jsdelivr.net/npm/three@0.153.0/examples/jsm/webxr/XRControllerModelFactory.js';
import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.153.0/examples/jsm/webxr/VRButton.js';

// Escena, cámara y renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

// Luz
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1).normalize();
scene.add(light);

// Crear un cubo
const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 1, -2); // Posiciona el cubo frente a la cámara
scene.add(cube);

// Controlador VR
const controller = renderer.xr.getController(0);
scene.add(controller);

// Movimientos del cubo
function moveCube() {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
}

// Animación
function animate() {
    renderer.setAnimationLoop(render);
}

function render() {
    moveCube();  // Aplica la rotación al cubo
    renderer.render(scene, camera);
}

animate();

// Ajuste de tamaño en caso de redimensionar la ventana
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});