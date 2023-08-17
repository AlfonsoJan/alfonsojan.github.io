export default class WireFrame {
    constructor(boundary=[500, 500, 500], color={color: 0x000000}) {
        this.boundaryX = boundary[0];
        this.boundaryY = boundary[1];
        this.boundaryZ = boundary[2];
        this.color = color.color
    }

    render() {
        const geometry = new THREE.BoxGeometry(this.boundaryX, this.boundaryY, this.boundaryZ);
        const wireframe = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(wireframe);
        line.material.color = new THREE.Color( this.color);
        line.material.transparent = false;
        line.position.x = this.boundaryX / 2;
        line.position.y = this.boundaryY / 2;
        line.position.z = this.boundaryZ / 2;
        return line;
    }
}