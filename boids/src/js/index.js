import Renderer from "./utils/Renderer.js";

/**
 * App class that calls all the necessary functions.
 */
class App {
    constructor() {
        // Initial number of boids and obstacles
        this.flockEntityCount = 60;
        this.obstacleEntityCount = 0;
    }

    init() {
        this.renderer = new Renderer();
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
    new App().init()
});
