import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
const renderer = new THREE.WebGLRenderer({ antialias: true });


renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.xr.enabled = true; // Habilitar VR

document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

// Luz ambiental
const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);

// Luz puntual desde la cámara
const spotlightMaterial = new THREE.MeshPhongMaterial({
    color: 0xFFFF00,
    transparent: true,
    opacity: 0,
});
const spotlightGeometry = new THREE.CylinderGeometry(0.1, 0.5, 1, 32);
const spotlight = new THREE.Mesh(spotlightGeometry, spotlightMaterial);
spotlight.rotation.x = -Math.PI / 2; // Orienta la luz hacia adelante
camera.add(spotlight); // Agrega la luz a la cámara
scene.add(camera);

// Cubemap
const path = '/penguins (44)/';
const format = '.jpg';
const urls = [
    path + 'lf' + format, path + 'rt' + format,
    path + 'up' + format, path + 'dn' + format,
    path + 'ft' + format, path + 'bk' + format,
];
const reflectionCube = new THREE.CubeTextureLoader().load(urls);
scene.background = reflectionCube;

// Geometría del cubo
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshPhongMaterial({ color: 0x1E90FF });
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 1, -2); // Posiciona el cubo frente a la cámara
scene.add(cube);

// Esfera de objetivo
const sphereGeometry = new THREE.SphereGeometry(0.5, 16, 16);
const sphereMaterial = new THREE.MeshPhongMaterial({ color: 0xFF0000 });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(3, 1, -5); // Coloca la esfera en una posición visible
scene.add(sphere);

// Piso
const floorGeometry = new THREE.PlaneGeometry(20, 10);
const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.y = -1;
floor.rotation.x = Math.PI / 2;
scene.add(floor);

// Variable para almacenar el estado del Gamepad
let gamepad;

// Detecta cuándo se conecta un Gamepad
window.addEventListener("gamepadconnected", (event) => {
    console.log("Gamepad conectado:", event.gamepad);
    gamepad = event.gamepad; // Guarda la referencia al Gamepad conectado
});

// Detecta cuándo se desconecta un Gamepad
window.addEventListener("gamepaddisconnected", (event) => {
    console.log("Gamepad desconectado:", event.gamepad);
    gamepad = null; // Limpia la referencia al Gamepad
});

// Control de la luz
let lightTimeout;

// Función para verificar los botones del Gamepad
function checkGamepad() {
    if (gamepad) {
        // Obtén el estado actualizado del Gamepad
        const gamepads = navigator.getGamepads();
        const currentGamepad = gamepads[gamepad.index];

        if (currentGamepad) {
            // Verifica si el botón "A" (índice 0) está presionado
            if (currentGamepad.buttons[0].pressed) {
                spotlightMaterial.opacity = 0.5; // Enciende la luz
                clearTimeout(lightTimeout);
                lightTimeout = setTimeout(() => {
                    spotlightMaterial.opacity = 0;
                }, 400); // Apaga la luz después de 0.4 segundos
            }
        }
    }
}

// Control de la luz
// let lightTimeout;
window.addEventListener('mousedown', () => {
    spotlightMaterial.opacity = 0.5; // Enciende la luz
    clearTimeout(lightTimeout);
    lightTimeout = setTimeout(() => {
        spotlightMaterial.opacity = 0;
    }, 400); // Apaga la luz después de 0.4 segundos
});

window.addEventListener('mouseup', () => {
    spotlightMaterial.opacity = 0;
    clearTimeout(lightTimeout);
});

// Colisiones
const raycaster = new THREE.Raycaster();
let score = 0;

// Función para detectar colisión
function checkCollision() {
    // Establece el rayo desde la posición de la cámara en la dirección de adelante
    const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion); // Dirección de la cámara
    raycaster.set(camera.position, direction);
    const intersects = raycaster.intersectObject(sphere);

    if (intersects.length > 0) { // Si hay una colisión, incrementa la puntuación y oculta la esfera
        scene.remove(sphere);
        score += 1;
        console.log("Puntuación:", score);
    }
}

// Animación
function animate() {
    if (spotlightMaterial.opacity > 0) {
        checkCollision();
    }

    renderer.render(scene, camera);

    // Verifica el estado del Gamepad en cada frame
    checkGamepad();


}

renderer.setAnimationLoop(animate);
