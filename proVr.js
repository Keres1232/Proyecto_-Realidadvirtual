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

const pointLight = new THREE.PointLight(0xFFA500, 1);
pointLight.castShadow = true;
scene.add(pointLight);
pointLight.position.set(0, 60, 30);
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

//Geomeotria 
//Camara


// Esfera de luz 
const spotlightGeometry = new THREE.CylinderGeometry( 0.5, 1, 3, 32 );
const spotlightMaterial = new THREE.MeshPhongMaterial({
    color: 0xFFFF00,
    transparent: true,
    opacity: 0 
});

const spotlight = new THREE.Mesh(spotlightGeometry, spotlightMaterial);
spotlight.position.set(2, 0, 0);
spotlight.rotation.z = Math.PI/2; 
cube.add(spotlight); 

//Objetivo 
const geometry1 = new THREE.SphereGeometry(0.5, 16, 16 ); 
const material1 = new THREE.MeshPhongMaterial( { color: 0xFF0000 } ); 
const sphere = new THREE.Mesh( geometry1, material1 ); 
scene.add( sphere );
sphere.position.set(3,0,0)

//Piso
const geometry2 = new THREE.PlaneGeometry( 20, 10 );
const material2 = new THREE.MeshPhongMaterial( {color: 0x00ff00 , side: THREE.DoubleSide} );
const piso = new THREE.Mesh( geometry2, material2 );
scene.add( piso );
piso.position.y =-1;
piso.rotation.x = Math.PI/2;

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

// Colisiones
const raycaster = new THREE.Raycaster();
let score = 0;

// Función para detectar colision
function checkCollision() {
    // rayo desde la luz en la dirección de la esfera
    raycaster.set(spotlight.position, new THREE.Vector3(1, 0, 0).normalize()); // Dirección de la luz
    const intersects = raycaster.intersectObject(sphere);

    if (intersects.length > 0) {  // Si hay una colisión, incrementa la puntuación y oculta la esfera
        scene.remove(sphere);
        score += 1;
        console.log("Puntuación:", score);
    }
}

class personaje {
    
}

class Enemy {
    constructor(scene, position = new THREE.Vector3(), speed = 0.05, maxDistance = 0.5) {
        // Crear geometría y material para el enemigo
        const geometry = new THREE.SphereGeometry(0.5, 16, 16);
        const material = new THREE.MeshPhongMaterial({ color: 0x16bdd5 });
        this.mesh = new THREE.Mesh(geometry, material);

        // Posicionar el enemigo
        this.mesh.position.copy(position);
        this.speed = speed;
        this.maxDistance = maxDistance

        // Agregar el enemigo a la escena
        scene.add(this.mesh);
    }

    /**
     * Verifica si el enemigo está siendo "observado" por la cámara.
     * @param {THREE.Camera} camera - La cámara de la escena.
     * @returns {boolean} - `true` si el enemigo está siendo observado, de lo contrario, `false`.
     */
    isBeingWatched(camera) {
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction); // Dirección hacia donde mira la cámara
        const toEnemy = new THREE.Vector3();
        toEnemy.subVectors(this.mesh.position, camera.position).normalize(); // Dirección hacia el enemigo

        // Calcular el ángulo entre la dirección de la cámara y el enemigo
        const dot = direction.dot(toEnemy);
        return dot > 0.8; // Si el ángulo es menor a ~36° (dot > cos(36°)), se considera que está siendo observado
    }

    /**
     * Mueve el enemigo hacia la cámara si no está siendo observado.
     * @param {THREE.Camera} camera - La cámara de la escena.
     */
    moveTowardCamera(camera) {
        const distanceToCamera = this.mesh.position.distanceTo(camera.position);

        // Si está dentro de la distancia máxima o siendo observado, no se mueve
        if (distanceToCamera <= this.maxDistance || this.isBeingWatched(camera)) {
            return;
        }

        // Mover al enemigo hacia la cámara
        const direction = new THREE.Vector3();
        direction.subVectors(camera.position, this.mesh.position).normalize(); // Dirección hacia la cámara
        this.mesh.position.addScaledVector(direction, this.speed); // Mover en esa dirección
    }
}

const enemy = new Enemy(scene, new THREE.Vector3(3, 1, -5), 0.002, 0); // Posición inicial y velocidad




// Animación
function animate() {
    if (spotlightMaterial.opacity > 0) {
        checkCollision();
    }

    renderer.render(scene, camera);

    // Mover al enemigo
    enemy.moveTowardCamera(camera);

    // Verifica el estado del Gamepad en cada frame
    checkGamepad();


}

renderer.setAnimationLoop(animate);
