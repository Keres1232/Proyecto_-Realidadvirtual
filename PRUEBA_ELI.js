import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.xr.enabled = true;

document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

// Agregar OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);

// Luz ambiental
const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);

// Piso
const geometry2 = new THREE.PlaneGeometry(20, 10);
const material2 = new THREE.MeshPhongMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
const piso = new THREE.Mesh(geometry2, material2);
scene.add(piso);
piso.position.y = -1;
piso.rotation.x = Math.PI / 2;

// Clase Personaje
class Personaje {
    constructor(scene, camera) {
        this.scene = scene;

        // Crear contenedor para el personaje
        this.character = new THREE.Object3D();
        scene.add(this.character);

        // Posicionar la cámara dentro del personaje
        this.character.add(camera);
        camera.position.set(0, 1.6, 0);

        // Velocidad del personaje
        this.speed = 0.1;

        // Agregar eventos de teclado
        this.keys = {};
        window.addEventListener('keydown', (e) => (this.keys[e.key] = true));
        window.addEventListener('keyup', (e) => (this.keys[e.key] = false));
    }

    move() {
        if (this.keys['w'] || this.keys['ArrowUp']) {
            this.character.translateZ(-this.speed); // Adelante
        }
        if (this.keys['s'] || this.keys['ArrowDown']) {
            this.character.translateZ(this.speed); // Atrás
        }
        if (this.keys['a'] || this.keys['ArrowLeft']) {
            this.character.translateX(-this.speed); // Izquierda
        }
        if (this.keys['d'] || this.keys['ArrowRight']) {
            this.character.translateX(this.speed); // Derecha
        }
    }
}

// Crear el personaje
const personaje = new Personaje(scene, camera);

// Animación
function animate() {
    personaje.move(); // Mover el personaje
    controls.update(); // Actualizar controles de cámara
    renderer.render(scene, camera);
}

// Configurar el bucle de animación
renderer.setAnimationLoop(animate);
