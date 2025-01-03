import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';

class Personaje {
    constructor(scene, camera) {
        this.scene = scene;

        // Crear un contenedor para el personaje
        this.character = new THREE.Object3D();
        scene.add(this.character);

        // Posicionar la cámara dentro del personaje
        this.character.add(camera);
        camera.position.set(0, 1.6, 0); // Ajustar altura

        // Linterna (luz puntual)
        this.linterna = new THREE.PointLight(0xFFFFFF, 1, 10); // Luz blanca
        this.linterna.position.set(0, 1.6, 0); // Nivel de la cámara
        this.character.add(this.linterna);
        this.linternaEncendida = false; // Estado inicial de la linterna

        // Material semitransparente para el haz de luz
        this.linternaMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFF00,
            transparent: true,
            opacity: 0,
        });

        // Haz de luz simulado
        const spotlightGeometry = new THREE.CylinderGeometry(0.5, 1, 3, 32);
        this.hazLuz = new THREE.Mesh(spotlightGeometry, this.linternaMaterial);
        this.hazLuz.position.set(0, -1.5, -2); // Frente al personaje
        this.hazLuz.rotation.x = Math.PI / 2;
        this.character.add(this.hazLuz);

        // Controlador de Gamepad
        this.gamepad = null;

        // Estado del botón
        this.lastButtonState = false;
    }

    toggleLinterna() {
        this.linternaEncendida = !this.linternaEncendida;
        this.linterna.visible = this.linternaEncendida;
        this.linternaMaterial.opacity = this.linternaEncendida ? 0.5 : 0; // Simula el haz de luz
    }

    checkGamepad() {
        const gamepads = navigator.getGamepads();
        if (gamepads[0]) {
            this.gamepad = gamepads[0];
            if (this.gamepad.buttons[0].pressed && !this.lastButtonState) {
                this.toggleLinterna();
                this.lastButtonState = true;
            }
            if (!this.gamepad.buttons[0].pressed && this.lastButtonState) {
                this.lastButtonState = false;
            }
        }
    }

    checkCollision(raycaster, targets) {
        if (this.linternaEncendida) {
            raycaster.set(this.character.position, new THREE.Vector3(0, 0, -1).applyQuaternion(this.character.children[0].quaternion));

            const intersects = raycaster.intersectObjects(targets);
            if (intersects.length > 0) {
                const hit = intersects[0].object;
                this.scene.remove(hit); // Elimina el objeto
                console.log("Objeto eliminado:", hit);
            }
        }
    }
}

class Enemy {
    constructor(scene, position = new THREE.Vector3(), speed = 0.05, maxDistance = 2) {
        const geometry = new THREE.SphereGeometry(0.5, 16, 16);
        this.material = new THREE.MeshPhongMaterial({ color: 0xFF0000 });
        this.mesh = new THREE.Mesh(geometry, this.material);
        this.mesh.position.copy(position);
        this.speed = speed;
        this.maxDistance = maxDistance;
        scene.add(this.mesh);
    }

    isBeingWatched(camera) {
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        const toEnemy = new THREE.Vector3();
        toEnemy.subVectors(this.mesh.position, camera.position).normalize();
        const dot = direction.dot(toEnemy);
        const beingWatched = dot > 0.5; // Observado si el ángulo es menor a ~60°
        this.material.color.set(beingWatched ? 0x00FF00 : 0xFF0000);
        return beingWatched;
    }

    moveTowardCamera(camera) {
        const distanceToCamera = this.mesh.position.distanceTo(camera.position);
        if (distanceToCamera <= this.maxDistance || this.isBeingWatched(camera)) return;
        const direction = new THREE.Vector3();
        direction.subVectors(camera.position, this.mesh.position).normalize();
        this.mesh.position.addScaledVector(direction, this.speed);
    }
}

//Colisiones
//const raycaster = new THREE.Raycaster();
let score = 0;

//Función para detectar colision
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

// Configuración de la escena
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

// Luz ambiental
const ambientLight = new THREE.AmbientLight(0x404040, 1);
scene.add(ambientLight);

// Piso
const geometry2 = new THREE.PlaneGeometry(20, 10);
const material2 = new THREE.MeshPhongMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
const piso = new THREE.Mesh(geometry2, material2);
scene.add(piso);
piso.position.y = -1;
piso.rotation.x = Math.PI / 2;

// Crear personaje y enemigo
const personaje = new Personaje(scene, camera);
const enemy = new Enemy(scene, new THREE.Vector3(0, 1, -5), 0.01, 3);

// Objetivo para colisiones
const targets = [];
const targetGeometry = new THREE.SphereGeometry(0.5, 16, 16);
const targetMaterial = new THREE.MeshPhongMaterial({ color: 0x0000FF });
for (let i = 0; i < 3; i++) {
    const target = new THREE.Mesh(targetGeometry, targetMaterial);
    target.position.set(i * 2 - 2, 0, -5);
    scene.add(target);
    targets.push(target);
}

// Animación
const raycaster = new THREE.Raycaster();
function animate() {
    personaje.checkGamepad();
    personaje.checkCollision(raycaster, targets);
    enemy.moveTowardCamera(camera);
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);


class Enemy {
    constructor(scene, position = new THREE.Vector3(), speed = 0.05, maxDistance = 2) {
        // Crear geometría y material para el enemigo
        const geometry = new THREE.SphereGeometry(0.5, 16, 16);
        this.material = new THREE.MeshPhongMaterial({ color: 0xFF0000 }); // Color inicial: rojo
        this.mesh = new THREE.Mesh(geometry, this.material);

        // Posicionar el enemigo
        this.mesh.position.copy(position);
        this.speed = speed;
        this.maxDistance = maxDistance; // Distancia máxima permitida a la cámara

        // Agregar el enemigo a la escena
        scene.add(this.mesh);
    }

    /**
     * Verifica si el enemigo está siendo "observado" por la cámara y actualiza su color.
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
        const beingWatched = dot > 0.8; 
        // Si el ángulo es menor a ~36° (dot > cos(36°)), se considera observado

        // Cambiar el color del enemigo según esté siendo observado o no
        this.material.color.set(beingWatched ? 0x00FF00 : 0xFF0000); // Verde si está siendo observado, rojo si no

        return beingWatched;
    }

    /**
     * Mueve el enemigo hacia la cámara si no está siendo observado y no excede la distancia máxima.
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