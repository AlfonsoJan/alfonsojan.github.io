import * as THREE from "https://cdn.skypack.dev/three@0.131.3";

import WireFrame from "./WireFrame.js";
import BoidsController from "./BoidsController.js";
import {createFishGeometry, createFishMaterial} from './Fish.js';

// Function to calculate the Z-coordinate based on X and Y with a fixed ratio
const calculateZ = (x, y) => {
    const targetX = 2000;
    const targetY = 1000;
    const targetZ = 200;
    const scaleFactor = targetZ / Math.sqrt((targetX ** 2) + (targetY ** 2));
    return Math.sqrt((x ** 2) + (y ** 2)) * scaleFactor;
}

/**
 * @module Renderer 
 * Renderer class to visualize entities and control the camera
 */
export default class Renderer {
    /**
     * Create a new Renderer instance
     */
    constructor(initAmount, cursor, color = 0xFFA500, scale = 1.5 ) {
        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 100000 );
        this.camera.position.z = 1000;
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x000000 );
        this.getWindowSize();
        
        this.mouse = new THREE.Vector3();
        this.mouseBird = new THREE.Vector2();
        this.vec = new THREE.Vector3();
        this.raycaster = new THREE.Raycaster();
        this.mouseMove = false;
        this.avoidMouse = false;
        this.dier = "vis"

        this.initAmount = initAmount
        this.color = color
        this.scale = scale

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.boidsController = new BoidsController(this.boundary, 1, this);
        this.boidsController.init();

        this.cursor = cursor;
        
    }

    /**
     * Initialize the renderer, create visual elements, and set up event listeners.
     */
    init() {
        // Create invisible boundary
        this.wireframe = new WireFrame(this.boundary, {color: 0x000000});
        this.wireframe.render(this.scene);
        


        this.fishEntityGeometry = createFishGeometry();
        this.fishEntityMaterial = createFishMaterial(this.color);
        let fishSize = new THREE.Box3().setFromBufferAttribute(this.fishEntityGeometry.attributes.position);
        this.fishEntityMaterial.userData.uniforms.totalLength.value = fishSize.max.x;

        this.fishMesh = new THREE.Mesh(this.fishEntityGeometry, this.fishEntityMaterial);

        this.entityGeometry = new THREE.ConeGeometry(3, 13, 6);
        this.entityMaterial = new THREE.MeshBasicMaterial({ color: 0xFFA500});
        this.coneMesh = new THREE.Mesh(this.entityGeometry, this.entityMaterial);

        this.obstacleGeometry = new THREE.SphereGeometry( 50, 15, 15 );
        this.obstacleMaterial = new THREE.MeshNormalMaterial();

        this.createGridVisual(this.boidsController.subDivisionCount);
        document.body.appendChild(this.renderer.domElement);

        this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.renderer.domElement.addEventListener('mouseout', this.onMouseOut.bind(this));
        this.updateCamera();
    }

    /**
     * Event handler for mouse movement over the renderer's DOM element.
     * @param {MouseEvent} event - The mouse event object.
     */
    onMouseOut(event) {
        this.mouse.x = -2;
        this.mouse.y = -2;
    }

    /**
     * Event handler for mouse leaving the renderer's DOM element.
     * @param {MouseEvent} event - The mouse event object.
     */
    onMouseMove(event) {
        // https://stackoverflow.com/questions/13055214/mouse-canvas-x-y-to-three-js-world-x-y-z
        // Unproject mouse coordinates to 3D space
        this.vec.set(
            ( event.clientX / window.innerWidth ) * 2 - 1,
            - ( event.clientY / window.innerHeight ) * 2 + 1,
            200
        );
        this.vec.unproject(this.camera);
        // Calculate 3D position of the mouse
        this.vec.sub(this.camera.position).normalize();
        let distance = (this.boundary[2] * 0.5 - this.camera.position.z) / this.vec.z;
        this.mouse.copy(this.camera.position).add(this.vec.multiplyScalar(distance));
        // Update cursor display and position
        if (this.avoidMouse) {
            this.cursor.style.display = ''
            this.cursor.style.left = `${Math.min((window.innerWidth - 20), event.clientX)}px`;
            this.cursor.style.top = `${Math.min((window.innerHeight - 20), event.clientY)}px`;
            document.body.style.cursor = 'none'
        } else {
            this.cursor.style.display = 'none'
            document.body.style.cursor = ''
        }
    }

    /**
     * Create grid visual representation needs some tweeking does not really work. Thats why its set to invisible
     */
    createGridVisual(subdivisionCount) {
        this.gridVisual = new THREE.Group();
        const b = this.boidsController.getBoundary();
        const maxLen = Math.max(b[0], b[1], b[2]);
        const len = maxLen/subdivisionCount;
        for (let x = 0; x < subdivisionCount; x++) {
            for (let y = 0; y < subdivisionCount; y++) {
                for (let z = 0; z < subdivisionCount; z++) {
                    if((x + 0.5) * len > b[0] || (y + 0.5) * len > b[1] || (z + 0.5) * len > b[2]) {
                        continue;
                    }
                    const geometry = new THREE.BoxGeometry(len, len, len);
                    const wireframe = new THREE.EdgesGeometry(geometry);
                    const line = new THREE.LineSegments(wireframe);
                    line.material.color = new THREE.Color( 0x999999 );
                    line.material.transparent = false;
                    line.position.x = len / 2 + x * len;
                    line.position.y = len / 2 + y * len;
                    line.position.z = len / 2 + z * len;
                    this.gridVisual.add(line);
                }
            }
        }

        this.scene.add(this.gridVisual);
        this.gridVisual.visible = false;
    }

    /**
     * Calculate the window size and set the camera position based on the boundary.
     */
    getWindowSize() {
        const vFOV = (this.camera.fov * Math.PI) / 180;
        const height = 2 * Math.tan(vFOV / 2) * Math.abs(this.camera.position.z);
        const width = height * this.camera.aspect;
        this.screenWidth = width / 2;
        this.screenHeight = height / 2;
        this.boundary = [this.screenWidth, this.screenHeight, calculateZ(this.screenWidth, this.screenHeight)]
    }

    /**
     * Update the camera position based on the boundary.
     */
    updateCamera() {
        this.camera.position.x = this.boundary[0] / 2;
        this.camera.position.y = this.boundary[1] / 2;
        this.camera.position.z = 650;
    }

    /**
     * Render the entities and obstacles in the scene.
     */
    render() {
        const entities = this.boidsController.getFlockEntities();
        entities.forEach((entity, index) => {
            const x = entity.x;
            const y = entity.y;
            const z = entity.z;
            const vx = entity.vx;
            const vy = entity.vy;
            const vz = entity.vz;
            let mesh = entity.mesh;
            // // EVERY FIRST TIME AND BOID IS ADDED THEN IT WILL NOT HAVE AN MESH
            if (!mesh) {
                if (this.dier === 'vis') {
                    mesh = this.fishMesh.clone()
                    mesh.scale.set(this.scale, this.scale, this.scale)
                } else {
                    console.log("Nu")
                    mesh = this.coneMesh.clone()
                }
                mesh.localVelocity = {x: 0, y: 0, z: 0};
                mesh.isEntity = true;
                this.scene.add(mesh);
                entity.mesh = mesh;
            }

            // Apply asymptotic smoothing
            mesh.position.x = 0.9 * mesh.position.x + 0.1 * x;
            mesh.position.y = 0.9 * mesh.position.y + 0.1 * y;
            mesh.position.z = 0.9 * mesh.position.z + 0.1 * z;
            mesh.localVelocity.x = 0.9 * mesh.localVelocity.x + 0.1 * vx;
            mesh.localVelocity.y = 0.9 * mesh.localVelocity.y + 0.1 * vy;
            mesh.localVelocity.z = 0.9 * mesh.localVelocity.z + 0.1 * vz;
            mesh.lookAt(
                mesh.position.x + mesh.localVelocity.x,
                mesh.position.y + mesh.localVelocity.y,
                mesh.position.z + mesh.localVelocity.z
            );

            if (this.dier === 'vis') {
                mesh.rotateY(THREE.Math.degToRad(90)); 
                mesh.rotateX(THREE.Math.degToRad(-45));
            } else {
                
                mesh.rotateX(THREE.Math.degToRad(90));
            }
        });

        const obstacles = this.boidsController.getObstacleEntities();
        obstacles.forEach(entity => {
            const x = entity.x;
            const y = entity.y;
            const z = entity.z;
            let mesh = entity.mesh;
            if(!mesh) {
                mesh = new THREE.Mesh(this.obstacleGeometry, this.obstacleMaterial);
                this.scene.add(mesh);
                entity.mesh = mesh;
            }
            
            mesh.position.x = x;
            mesh.position.y = y;
            mesh.position.z = z;
        });

        this.renderer.render(this.scene, this.camera);
    }
}