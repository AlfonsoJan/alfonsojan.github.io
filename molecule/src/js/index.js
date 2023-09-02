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



class PDBAtom {
    constructor(string) {
        this.name = string.slice(12, 17).trim();
        this.x = parseFloat(string.slice(30, 38).trim())
        this.y = parseFloat(string.slice(38, 46).trim())
        this.z = parseFloat(string.slice(46, 54).trim())
        this.warnings = []
        if (string.length < 78) {
            this.element = string.slice(12, 16).trim()
            this.warnings.push(`Chemical element name guessed to be ${this.element} from atom name ${this.name} `)
        } else {
            this.element = string.slice(76, 78).trim()
        }
        this.bonds = []
    }
}

class PDBMolecule {
    constructor(e, scene) {
        this.scene = scene
        this.atoms = []
        this.#parsePdb(e.target.result.split("\n"))
        this.#centerOfMass()
        this.#renderMolceule()
        
    }
    #parsePdb(content) {
        content.forEach(line => {
            if (line.startsWith('ATOM') || line.startsWith('HETATM')) {
                this.atoms.push(new PDBAtom(line))
            }
        })
    }
    #centerOfMass() {
        let x = 0
        let y = 0
        let z = 0
        this.atoms.forEach(atom => {
            x += atom.x
            y += atom.y
            z += atom.z
        })
        this.center = [x / this.atoms.length, y / this.atoms.length, z / this.atoms.length]
        this.atoms.forEach(atom => {
            atom.x -= this.center[0]
            atom.y -= this.center[1]
            atom.z -= this.center[2]
        })
    }
    #renderMolceule() {
        this.geometry = new THREE.Geometry();
        this.atoms.forEach(atom => {
            let size;
            let color;
            if (atomInfo[atom.name] == undefined) {
                size = atomInfo._.size
                color = atomInfo._.color
            } else {
                size = atomInfo[atom.name].size
                color = atomInfo[atom.name].color
            }
            let geo = new THREE.SphereGeometry(size, 16, 16);
            geo.translate(atom.x, atom.y, atom.z)
            for (let i = 0; i < geo.faces.length; i ++) {
                let face = geo.faces[i];
                face.color.set(color);
            }
            this.geometry.merge(geo);
        })
        this.material = new THREE.MeshPhongMaterial({color: 0xffffff, vertexColors: THREE.VertexColors})
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh)

        const ambientLight = new THREE.AmbientLight(0x404040);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1).normalize();
        this.scene.add(ambientLight);
        this.scene.add(directionalLight);
    }
}

class Renderer {
    constructor(e) {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        this.camera.position.z = 200;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x000000 );
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        window.requestAnimationFrame(this.render.bind(this));
        this.pdbFile = new PDBMolecule(e, this.scene);

        this.initStep = false;
        
    }

    // https://discourse.threejs.org/t/camera-zoom-to-fit-object/936/23
    updateCamera(offset) {
        offset = offset || 0;
        const boundingBox  = new THREE.Box3();
        boundingBox .setFromObject(this.pdbFile.mesh);
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
            0.1 // Adjust this value to control the speed of the camera adjustment
        );
    
        this.camera.position.copy(newPosition);

        return 0.3 > Math.abs(temp.z - newPosition.z);
    }

    render() {
        window.requestAnimationFrame(this.render.bind(this));
        
        if (this.initStep) {
            this.pdbFile.mesh.rotation.x += 0.001;
            this.pdbFile.mesh.rotation.y += 0.001;
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
        if (!file.length) {
            // TODO: ERROR HAND
            return;
        }
        let reader = new FileReader();
        reader.addEventListener('load', function(e) {
            //REMOVE WHOLE BODY
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