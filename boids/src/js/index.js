import Renderer from "./utils/Renderer.js";
import * as THREE from "https://cdn.skypack.dev/three@0.131.3";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * App class that calls all the necessary functions.
 */
class App {
    constructor(birdMesh) {
        // Initial number of boids and obstacles
        this.flockEntityCount = 60;
        this.obstacleEntityCount = 0;
        this.birdMesh = birdMesh;
    }

    init() {
        this.renderer = new Renderer(this.birdMesh, this.flockEntityCount);
        this.renderer.init();
        this.boidsController = this.renderer.boidsController,
        this.boidsController.addBoids(this.flockEntityCount)
        this.boidsController.addObstacles(this.obstacleEntityCount)
        // Request the first animation frame
        window.requestAnimationFrame(this.render.bind(this));
    }

    render() {
        window.requestAnimationFrame(this.render.bind(this));
        this.boidsController.iterate(this.renderer.mouse, this.renderer.avoidMouse);
        this.renderer.render();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const loader = new GLTFLoader();
    loader.load("./src/images/bird.gltf", (gltf) => {
        
        const mesh = gltf.scene;
        const scale = 4;
        mesh.scale.set(scale, scale, scale);
        mesh.traverse((child) => {
            if (child.isMesh) { child.material = new THREE.MeshBasicMaterial({color: 0xFFA500}) }
        })
        let app = new App(mesh)
        app.init()
    })
});
