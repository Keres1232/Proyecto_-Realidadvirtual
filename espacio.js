import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
const renderer = new THREE.WebGLRenderer({
    antialias: true, // Mejora la calidad del renderizado
});

// Configuración del renderer
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Luz ambiental
const ambientLight = new THREE.AmbientLight(0x00008B, 0.6);
scene.add(ambientLight);

// Luz puntual
const pointLight = new THREE.PointLight(0xFFD700,0.5 );
pointLight.position.set(0, 50, 50);
pointLight.castShadow = true;
scene.add(pointLight);

// Configuración de la cámara
camera.position.set(0, 100, 400);


// Controles orbitales
const controls = new OrbitControls(camera, renderer.domElement);

// Cubemap
const path = "/penguins (44)/";
const format = ".jpg";
const urls = [
    path + "lf" + format, path + "rt" + format,
    path + "up" + format, path + "dn" + format,
    path + "ft" + format, path + "bk" + format,
];
const reflectionCube = new THREE.CubeTextureLoader().load(urls);
scene.background = reflectionCube;

//Alboles 
let loaderArbol = new FBXLoader();
loaderArbol.load('/ARBOL.fbx', function(Arbol){
    scene.add(Arbol);
    Arbol.scale.set(1,1,3);
    Arbol.position.set(0,0,0);
    Arbol.receiveShadow = true;
});

// Animación
function animate() {
    controls.update(); // Actualizar controles orbitales
    renderer.render(scene, camera); // Renderizar escena
}

renderer.setAnimationLoop(animate);
