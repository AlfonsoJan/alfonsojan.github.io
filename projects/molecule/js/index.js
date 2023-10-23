import * as THREE from 'three';
import PDBMolecule from "./PDBMolecule.js";

class Renderer {
    constructor(e) {
        this.initStep = false;
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        this.camera.position.z = 200;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x000000 );
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => {
            const newWidth = window.innerWidth;
            const newHeight = window.innerHeight;
            this.camera.aspect = newWidth / newHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(newWidth, newHeight);
        })

        this.PDBMolecule = new PDBMolecule(e);

        const ambientLight = new THREE.AmbientLight(0x101010);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        directionalLight.position.set(1, 1, 1).normalize();
        this.scene.add(ambientLight);
        this.scene.add(directionalLight);

        this.scene.add(this.PDBMolecule.mesh);

        window.requestAnimationFrame(this.render.bind(this));
    }

    // https://discourse.threejs.org/t/camera-zoom-to-fit-object/936/23
    updateCamera(offset) {
        offset = offset || 0;
        const boundingBox  = new THREE.Box3();
        boundingBox .setFromObject(this.PDBMolecule.mesh);
        const center = boundingBox.getCenter(new THREE.Vector3());
        const size = boundingBox.getSize(new THREE.Vector3());
        const startDistance = center.distanceTo(this.camera.position);
        const endDistance = this.camera.aspect > 1 ? ((size.y/2)+offset) / Math.abs(Math.tan(this.camera.fov/2)) : ((size.y/2)+offset) / Math.abs(Math.tan(this.camera.fov/2)) / this.camera.aspect;
        const newPosition = new THREE.Vector3().copy(this.camera.position);
        const temp = new THREE.Vector3(
            this.camera.position.x * endDistance / startDistance,
            this.camera.position.y * endDistance / startDistance,
            this.camera.position.z * endDistance / startDistance,
        )
        newPosition.lerp(
            temp,
            0.03 // Adjust this value to control the speed of the camera adjustment
        );
    
        this.camera.position.copy(newPosition);

        return 0.5 > Math.abs(temp.z - newPosition.z);
    }

    render() {
        window.requestAnimationFrame(this.render.bind(this));
        
        if (this.initStep) {
            this.PDBMolecule.mesh.rotation.x += 0.002;
            this.PDBMolecule.mesh.rotation.y += 0.002;
        } else {
            const positionReached = this.updateCamera();
            if (positionReached) { this.initStep = true; }
        }
        this.renderer.render(this.scene, this.camera);
    }
}

let pageFunctions = {
    pdbFile: undefined,
    submitFasta(e) {
        e.preventDefault();
        pageFunctions.run()
    },
    run() {
        let file = document.getElementById("file_input").files
        if (file.length === 0) {
            // TODO: ERROR HAND
            return;
        }
        let reader = new FileReader();
        reader.addEventListener('load', function(e) {
            let elems = ['navBar', 'mainBody', 'footer']
            elems.forEach(elem => {
                const elementToRemove = document.getElementById(elem);
                elementToRemove.parentNode.removeChild(elementToRemove);
            })
            document.body.removeAttribute('style')
            document.body.style.display = 'flex'
            document.body.style.paddingBottom  = 0
            new Renderer(e)
        })
        reader.readAsText(file[0], "UTF-8")
    }
}

document.getElementById("submitButton").addEventListener('click', pageFunctions.submitFasta)