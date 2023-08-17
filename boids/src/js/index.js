import Renderer from "./utils/Renderer.js";
import Controller from './utils/Controller.js'

class App {
    constructor() {
        this.flockEntityCount = 60;
        this.obstacleEntityCount = 0;
    }

    init() {
        this.renderer = new Renderer();
        this.renderer.init();
        this.boidsController = this.renderer.boidsController,
        this.controller = new Controller(this.boidsController, this.renderer);
        this.controller.init();
        this.controller.addBoids(this.flockEntityCount);
        this.controller.addObstacles(this.obstacleEntityCount);
        window.requestAnimationFrame(this.render.bind(this));
    }

    render() {
        window.requestAnimationFrame(this.render.bind(this));
        this.boidsController.iterate(this.renderer.mouse, this.renderer.camera);
        this.renderer.render();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App().init()
});
