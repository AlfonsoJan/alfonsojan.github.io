import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import PDBAtom from "./PDBAtom.js"

let atomInfo = {
    C: { color: 0x666666, size: 1 },
    Cr: { color: 0x00FF00, size: 1 },
    H: { color: 0xFFFFFF, size: 0.65 },
    HH: { color: 0xFFFFFF, size: 0.65 },
    N: { color: 0x0000FF, size: 0.9 },
    O: { color: 0xFF0000, size: 1 },
    OH: { color: 0xFF0000, size: 1 },
    P: { color: 0xFF7F00, size: 1.25 },
    S: { color: 0x99CC33, size: 1.2 },
    _: { color: 0x00FFFF, size: 0.5 },
}

export default class PDBMolecule {
    constructor(e, scene) {
        this.scene = scene
        this.atoms = []
        this.#parsePdb(e.target.result.split("\n"))
        this.#centerOfMass()
        this.#renderMolecule()
        
    }
    #parsePdb(content) {
        content.forEach(line => {
            if (line.startsWith('ATOM') || line.startsWith('HETATM')) {
                this.atoms.push(new PDBAtom(line))
            }
        })
    }
    #centerOfMass() {
        const sum = this.atoms.reduce((acc, atom) => ({
            x: acc.x + atom.x,
            y: acc.y + atom.y,
            z: acc.z + atom.z,
        }), { x: 0, y: 0, z: 0 });
        this.center = {
            x: sum.x / this.atoms.length,
            y: sum.y / this.atoms.length,
            z: sum.z / this.atoms.length,
        };
        this.atoms.forEach(atom => {
            atom.x -= this.center.x;
            atom.y -= this.center.y;
            atom.z -= this.center.z;
        });
    }

    createSphereGeometry(radius, widthSegments, heightSegments) {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const normals = [];

        for (let i = 0; i <= heightSegments; i++) {
            const theta = (i / heightSegments) * Math.PI;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let j = 0; j <= widthSegments; j++) {
                const phi = (j / widthSegments) * 2 * Math.PI;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                const x = radius * sinTheta * cosPhi;
                const y = radius * sinTheta * sinPhi;
                const z = radius * cosTheta;

                vertices.push(x, y, z);

                const normal = new THREE.Vector3(x, y, z).normalize();
                normals.push(normal.x, normal.y, normal.z);

            }
        }

        const indices = [];
        for (let i = 0; i < heightSegments; i++) {
            for (let j = 0; j < widthSegments; j++) {
                const first = i * (widthSegments + 1) + j;
                const second = first + widthSegments + 1;

                indices.push(first, second, first + 1);
                indices.push(second, second + 1, first + 1);
            }
        }

        geometry.setIndex(indices);
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));

        return geometry;
    }
    
    #renderMolecule() {
        const geometries  = [];

        this.atoms.forEach(atom => {
            let sphereGeometry;
            let color;
            if (atomInfo[atom.name] == undefined) {
                color = new THREE.Color(atomInfo._.color);
                sphereGeometry  =  this.createSphereGeometry(atomInfo._.size, 16, 16)
            } else {
                color = new THREE.Color(atomInfo[atom.name].color)
                sphereGeometry  =  this.createSphereGeometry(atomInfo[atom.name].size, 16, 16)
            }
            sphereGeometry.translate(atom.x, atom.y, atom.z);
            
            const colorArray = new Float32Array(sphereGeometry.attributes.position.count * 3);
            for (let i = 0; i < colorArray.length; i += 3) {
                color.toArray(colorArray, i);
            }
            sphereGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

            geometries.push(sphereGeometry);

        })
        // Merge the buffer geometries into one
        const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries)
        // Create the material with vertex colors
        const material = new THREE.MeshPhongMaterial({ vertexColors: true });

        // Create the mesh
        this.mesh = new THREE.Mesh(mergedGeometry, material);
        this.scene.add(this.mesh);

        const ambientLight = new THREE.AmbientLight(0x101010);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        directionalLight.position.set(1, 1, 1).normalize();
        this.scene.add(ambientLight);
        this.scene.add(directionalLight);
    }
}