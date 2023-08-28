import Entity from './Entity.js'

export default class ControlHelper {
    constructor(boidsController, renderer) {
        this.boidsController = boidsController;
        this.renderer = renderer;
        this.maxBoids = 300;
        this.maxObstacles = 30;
    }

    init() {
        const gui = new dat.GUI();
        gui.domElement.id = 'gui';
        gui.add(this.boidsController, 'aligmentWeight',0,5).name('Alignment');
        gui.add(this.boidsController, 'cohesionWeight',0,5).name('Cohesion');
        gui.add(this.boidsController, 'separationWeight',0,5).name('Separation');
        gui.add(this.boidsController, 'maxEntitySpeed',1,10).name('Max Speed');
        gui.add(this.boidsController, 'scatterFactor', 100, 300).name('Scatter Force');
        this.boidsButton = gui.add(this, 'addBoids');
        this.obstacleButton = gui.add(this, 'addObstacles');
        gui.add(this.renderer, 'avoidMouse').name('Avoid Mouse');
        this.updateButtonLabels();
    }

    addBoids(count=10) {
        if (this.boidsController.getFlockEntities().length >= this.maxBoids) return;
        const boundary = this.boidsController.getBoundary();
        for(let i=0; i < count; i++) {
            const x = Math.floor(Math.random() * boundary[0]);
            const y = Math.floor(Math.random() * boundary[1]);
            const z = Math.floor(Math.random() * boundary[2]);
            const vx = (Math.random() * 4) - 2;
            const vy = (Math.random() * 4) - 2;
            const vz = (Math.random() * 4) - 2;
            
            const entity = new Entity(Entity.FLOCK_ENTITY, x, y, z, vx, vy, vz);
            this.boidsController.addFlockEntity(entity);
        }
        this.updateButtonLabels();
    }

    addObstacles(obstacleCount = 5) {
        if (this.boidsController.getObstacleEntities().length >= this.maxObstacles) return;
        const boundary = this.boidsController.getBoundary();
        for(let i=0; i < obstacleCount; i++) {
            const x = Math.floor(Math.random() * boundary[0]);
            const y = Math.floor(Math.random() * boundary[1]);
            const z = Math.floor(Math.random() * boundary[2]);
            
            const entity = new Entity(Entity.OBSTACLE_ENTITY, x, y, z);
            this.boidsController.addObstacleEntity(entity);
        }

        this.updateButtonLabels();
    }

    updateButtonLabels() {
        this.boidsButton.name('Add Boids (' + this.boidsController.getFlockEntities().length + ')');
        this.obstacleButton.name('Add Obs (' + this.boidsController.getObstacleEntities().length + ')');
    }
}