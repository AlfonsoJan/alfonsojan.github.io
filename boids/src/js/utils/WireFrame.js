/**
 * @module WireFrame 
 * WireFrame class that will create a boundary for the entities
 */
export default class WireFrame {
    /**
     * Create a new WireFrame instance
     * @param {Array} boundary - Array specifying the dimensions of the wireframe boundary [width, height, depth]
     * @param {Object} color - Object specifying the color of the wireframe
     */
    constructor(boundary=[500, 500, 500], color={color: 0x000000}) {
        this.boundary = boundary;
        this.color = color.color
    }

    /**
     * Render the wireframe in the specified scene
     * @param {THREE.Scene} scene - The Three.js scene where the wireframe will be added
     */
    render(scene) {
        const geometry = new THREE.BoxGeometry(...this.boundary);
        const wireframe = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(wireframe);
        line.material.color = new THREE.Color( this.color);
        line.material.transparent = false;
        line.position.x = this.boundary[0] / 2;
        line.position.y = this.boundary[1] / 2;
        line.position.z = this.boundary[2] / 2;
        scene.add(line);
    }
}