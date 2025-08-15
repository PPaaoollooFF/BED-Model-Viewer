import * as THREE from 'https://unpkg.com/three@0.150.1/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.150.1/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.150.1/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

const loader = new GLTFLoader();
const loadedModels = {};

function centerCameraOn(model) {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3()).length();
  const distance = size * 1.5;

  camera.position.set(center.x, center.y + distance / 4, center.z + distance);
  controls.target.copy(center);
  controls.update();
}

function loadModel(name) {
  const file = `${name}.glb`;
  console.log(`Attempting to load: ${file}`);

  loader.load(file,
    gltf => {
      const model = gltf.scene;
      model.name = name;
      model.scale.set(10, 10, 10); // Adjust scale if needed
      model.position.set(0, 0, 0);
      scene.add(model);
      loadedModels[name] = model;
      centerCameraOn(model);
      console.log(`✅ Loaded: ${file}`);
    },
    xhr => {
      const percent = xhr.total ? (xhr.loaded / xhr.total * 100).toFixed(1) : '...';
      console.log(`📦 ${name}: ${percent}% loaded`);
    },
    error => {
      console.error(`❌ Error loading ${file}:`, error);
    }
  );
}

function unloadModel(name) {
  const model = loadedModels[name];
  if (model) {
    scene.remove(model);
    delete loadedModels[name];
    console.log(`🗑️ Unloaded: ${name}.glb`);
  }
}

document.getElementById('modelForm').addEventListener('change', e => {
  const name = e.target.value;
  if (e.target.checked) {
    loadModel(name);
  } else {
    unloadModel(name);
  }
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
