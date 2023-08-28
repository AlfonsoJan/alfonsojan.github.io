export default class WireFrame {
    constructor(boundary=[500, 500, 500], color={color: 0x000000}) {
        this.boundary = boundary;
        this.color = color.color
    }

    render() {
        const geometry = new THREE.BoxGeometry(...this.boundary);
        const wireframe = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(wireframe);
        line.material.color = new THREE.Color( this.color);
        line.material.transparent = false;
        line.position.x = this.boundary[0] / 2;
        line.position.y = this.boundary[1] / 2;
        line.position.z = this.boundary[2] / 2;
        return line;
    }
}