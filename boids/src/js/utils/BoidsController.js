import Entity from './Entity.js';
import Grid from './Grid.js'

/**
 * @module BoidsController 
 * BoidsController class defines a container for boids entities.
 * All entities are added to BoidsController.
 * BoidsController calculates and updates entity positions and velocities.
 */
export default class BoidsController {
    /**
     * 
     * @param {number[]} boundary - The boundaries of the simulation area in [x, y, z] dimensions.
     * @param {number} subDivisionCount - The number of subdivisions for the grid.
     * @param {Renderer|null} renderer - The renderer instance for GUI interaction.
     */
    constructor(boundary=[500,500,500], subDivisionCount=1, renderer=null) {
        this.renderer = renderer;
        const maxSize = Math.max(...boundary);
        this.grid = new Grid(maxSize, maxSize/subDivisionCount);
        this.subDivisionCount = subDivisionCount;

        this.flockEntities = [];
        this.obstacleEntities = [];

        this.boundary = boundary

        this.aligmentWeight = 2.0;
        this.cohesionWeight = 4;
        this.separationWeight = 0.3;

        this.maxEntitySpeed = 5;

        this.aligmentRadius = 100;
        this.cohesionRadius = 100;
        this.separationRadius = 100;
        this.obstacleRadius = 100;
        this.mouseRadius = 200;

        this.scatterFactor = 200;
        
        this.maxBoids = 300;
        this.maxObstacles = 30;
    }
    /**
     * Initialize the graphical user interface (GUI) and its controls.
     */
    init() {
        const gui = new dat.GUI();
        gui.domElement.id = 'gui';
        gui.add(this, 'aligmentWeight', 0, 5).name('Alignment');
        gui.add(this, 'cohesionWeight', 0, 5).name('Cohesion');
        gui.add(this, 'separationWeight', 0, 5).name('Separation');
        gui.add(this, 'maxEntitySpeed', 1, 10).name('Max Speed');
        gui.add(this, 'scatterFactor', 100, 300).name('Scatter Force');
        this.boidsButton = gui.add(this, 'addBoids');
        this.obstacleButton = gui.add(this, 'addObstacles');
        gui.add(this.renderer, 'avoidMouse').name('Avoid Mouse');
        this.updateButtonLabels();
    }

    /**
     * Add a specified number of boids to the simulation.
     * 
     * @param {number} count - The number of boids to add.
     */
    addBoids(count=10) {
        if (this.getFlockEntities().length >= this.maxBoids) return;
        for(let i=0; i < count; i++) {
            const x = Math.floor(Math.random() * this.boundary[0]);
            const y = Math.floor(Math.random() * this.boundary[1]);
            const z = Math.floor(Math.random() * this.boundary[2]);
            const vx = (Math.random() * 4) - 2;
            const vy = (Math.random() * 4) - 2;
            const vz = (Math.random() * 4) - 2;
            
            const entity = new Entity(Entity.FLOCK_ENTITY, x, y, z, vx, vy, vz);
            this.addFlockEntity(entity);
        }
        this.updateButtonLabels();
    }

    /**
     * Add a specified number of obstacles to the simulation.
     * 
     * @param {number} obstacleCount - The number of obstacles to add.
     */
    addObstacles(obstacleCount = 5) {
        if (this.getObstacleEntities().length >= this.maxObstacles) return;
        for(let i=0; i < obstacleCount; i++) {
            const x = Math.floor(Math.random() * this.boundary[0]);
            const y = Math.floor(Math.random() * this.boundary[1]);
            const z = Math.floor(Math.random() * this.boundary[2]);
            
            const entity = new Entity(Entity.OBSTACLE_ENTITY, x, y, z);
            this.addObstacleEntity(entity);
        }

        this.updateButtonLabels();
    }

    /**
     * Update the labels of GUI buttons based on entity counts.
     */
    updateButtonLabels() {
        this.boidsButton.name('Add Boids (' + this.getFlockEntities().length + ')');
        this.obstacleButton.name('Add Obs (' + this.getObstacleEntities().length + ')');
    }

    /**
     * Add a flock entity to the simulation and grid.
     * 
     * @param {Entity} entity - The flock entity to add.
     */
    addFlockEntity(entity) {
        this.grid.addEntity(entity);
        this.flockEntities.push(entity);
    }

    /**
     * Get the list of flock entities in the simulation.
     * 
     * @returns {Entity[]} An array of flock entities.
     */
    getFlockEntities() {
        return this.flockEntities;
    }

    /**
     * Add an obstacle entity to the simulation and grid.
     * 
     * @param {Entity} entity - The obstacle entity to add.
     */
    addObstacleEntity(entity) {
        this.grid.addEntity(entity);
        this.obstacleEntities.push(entity);
    }

    /**
     * Get the list of obstacle entities in the simulation.
     * 
     * @returns {Entity[]} An array of obstacle entities.
     */
    getObstacleEntities() {
        return this.obstacleEntities;
    }

    /**
     * Get the boundaries of the simulation area.
     * 
     * @returns {number[]} An array representing the [x, y, z] boundaries.
     */
    getBoundary() {
        return this.boundary;
    }

    /**
     * iterate calculates the new position for flock entities.
     * start and end indices are used for parallelization of this calculation
     * @param {Object} mouse mouse location as an vector obj
     * @param {Boolean} avoidMouse if the avoid mouse is selected
     */
    iterate(mouse=null, avoidMouse=false) {
        let mouseOnScreen = !(mouse.x === -2 && mouse.y === -2);

        for(let i=0; i < this.flockEntities.length; i++) {
            const entity = this.flockEntities[i];
            const aligmentVel = this.computeAlignment(entity);
            const cohVel = this.computeCohesion(entity);
            const sepVel = this.computeSeparation(entity);
            const obsVel = this.computeObstacles(entity);
            
            const mouseVector = new THREE.Vector2(mouse.x, mouse.y);
            const entityVector2d = new THREE.Vector2(entity.x, entity.y);
            const distance = mouseVector.distanceTo(entityVector2d)
            // Adjust velocities based on boid behavior and mouse interaction
            if (mouseOnScreen && avoidMouse && distance <= this.mouseRadius) {
                entity.addVelocity(this.aligmentWeight * this.scatterFactor * aligmentVel[0], this.aligmentWeight * this.scatterFactor * aligmentVel[1], this.aligmentWeight * this.scatterFactor * aligmentVel[2]);
                entity.addVelocity(this.cohesionWeight * this.scatterFactor * cohVel[0], this.cohesionWeight * this.scatterFactor * cohVel[1], this.cohesionWeight * this.scatterFactor * cohVel[2]);
                entity.addVelocity(50 * this.separationWeight * this.scatterFactor * sepVel[0], 50 * this.separationWeight * this.scatterFactor * sepVel[1], 50 * this.separationWeight * this.scatterFactor * sepVel[2]);
                
            } else {
                const vx = this.aligmentWeight * aligmentVel[0] + this.cohesionWeight * cohVel[0] + 50 * this.separationWeight * sepVel[0] + 100 * obsVel[0];
                const vy = this.aligmentWeight * aligmentVel[1] + this.cohesionWeight * cohVel[1] + 50 * this.separationWeight * sepVel[1] + 100 * obsVel[1];
                const vz = this.aligmentWeight * aligmentVel[2] + this.cohesionWeight * cohVel[2] + 50 * this.separationWeight * sepVel[2] + 100 * obsVel[2];
                entity.addVelocity(vx, vy, vz);
            }
            
            entity.move(this.maxEntitySpeed, ...this.boundary);
        }
    }

    /**
     * Calculate the alignment velocity for a given entity.
     * 
     * @param {Entity} entity - The entity for which to calculate alignment.
     * @returns {number[]} The alignment velocity components.
     */
    computeAlignment(entity) {
        let aligmentX = 0;
        let aligmentY = 0;
        let aligmentZ = 0;
        let neighborCount = 0;

        this.grid.getEntitiesInCube(entity.x, entity.y, entity.z, this.aligmentRadius, (currentEntity) => {
            if (currentEntity != entity && currentEntity.getType() == Entity.FLOCK_ENTITY &&  entity.getDistance(currentEntity) < this.aligmentRadius) {
                neighborCount++;
                aligmentX += currentEntity.vx;
                aligmentY += currentEntity.vy;
                aligmentZ += currentEntity.vz;
            }
        });

        if(neighborCount > 0) {
            aligmentX /= neighborCount;
            aligmentY /= neighborCount;
            aligmentZ /= neighborCount;
            const aligmentMag = Math.sqrt((aligmentX*aligmentX)+(aligmentY*aligmentY)+(aligmentZ*aligmentZ));
            if (aligmentMag > 0) {
                aligmentX /= aligmentMag;
                aligmentY /= aligmentMag;
                aligmentZ /= aligmentMag;
            }
        }

        return [aligmentX, aligmentY, aligmentZ];
    }

    /**
     * Calculate the cohesion velocity for a given entity.
     * 
     * @param {Entity} entity - The entity for which to calculate cohesion.
     * @returns {number[]} The cohesion velocity components.
     */
    computeCohesion(entity) {
        let cohX = 0;
        let cohY = 0;
        let cohZ = 0;
        let neighborCount = 0;

        this.grid.getEntitiesInCube(entity.x, entity.y, entity.z, this.cohesionRadius, (currentEntity) => {
            if (currentEntity != entity && currentEntity.getType() == Entity.FLOCK_ENTITY && entity.getDistance(currentEntity) < this.cohesionRadius) {
                neighborCount++;
                cohX += currentEntity.x;
                cohY += currentEntity.y;
                cohZ += currentEntity.z;
            }
        });

        if (neighborCount > 0) {
            cohX /= neighborCount;
            cohY /= neighborCount;
            cohZ /= neighborCount;

            cohX = cohX - entity.x;
            cohY = cohY - entity.y;
            cohZ = cohZ - entity.z;

            let cohMag = Math.sqrt((cohX * cohX) + (cohY * cohY) + (cohZ * cohZ));
            if (cohMag > 0) {
                cohX /= cohMag;
                cohY /= cohMag;
                cohZ /= cohMag;
            }
        }

        return [cohX, cohY, cohZ];
    }

    /**
     * Calculate the seperation velocity for a given entity.
     * 
     * @param {Entity} entity - The entity for which to calculate seperation.
     * @returns {number[]} The seperation velocity components.
     */
    computeSeparation(entity) {
        let sepX = 0;
        let sepY = 0;
        let sepZ = 0;
        let neighborCount = 0;

        this.grid.getEntitiesInCube(entity.x, entity.y, entity.z, this.separationRadius, (currentEntity) => {
            let distance = entity.getDistance(currentEntity);
            if (distance <= 0) {
                distance = 0.01
            }
            
            if (currentEntity != entity && currentEntity.getType() == Entity.FLOCK_ENTITY && distance < this.separationRadius) {
                neighborCount++;
                const sx = entity.x - currentEntity.x;
                const sy = entity.y - currentEntity.y;
                const sz = entity.z - currentEntity.z;
                sepX += (sx / distance) / distance;
                sepY += (sy / distance) / distance;
                sepZ += (sz / distance) / distance;
            }
        });

        return [sepX, sepY, sepZ];
    }

    /**
     * Calculate the obstacle velocity for a given entity.
     * 
     * @param {Entity} entity - The entity for which to calculate obstacle.
     * @returns {number[]} The obstacle velocity components.
     */
    computeObstacles(entity) {
        let avoidX = 0;
        let avoidY = 0;
        let avoidZ = 0;

        this.grid.getEntitiesInCube(entity.x, entity.y, entity.z, this.obstacleRadius, (currentObstacle) => {
            const distance = entity.getDistance(currentObstacle);
            if (distance > 0 && currentObstacle.getType() == Entity.OBSTACLE_ENTITY && distance < this.obstacleRadius) {
                const ox = entity.x - currentObstacle.x;
                const oy = entity.y - currentObstacle.y;
                const oz = entity.z - currentObstacle.z;
                avoidX += (ox / distance) / distance;
                avoidY += (oy / distance) / distance;
                avoidZ += (oz / distance) / distance;
            }
        });

        // avoid boundary limits
        const boundaryObstacleRadius = this.obstacleRadius / 4;
        const distX = this.boundary[0] - entity.x;
        const distY = this.boundary[1] - entity.y;
        const distZ = this.boundary[2] - entity.z;
        if (entity.x < boundaryObstacleRadius && Math.abs(entity.x) > 0) {
            avoidX += 1 / entity.x;
        } else if (distX < boundaryObstacleRadius && distX > 0) {
            avoidX -= 1 / distX;
        }
        if (entity.y < boundaryObstacleRadius && Math.abs(entity.y) > 0) {
            avoidY += 1 / entity.y;
        } else if (distY < boundaryObstacleRadius && distY > 0) {
            avoidY -= 1 / distY;
        }
        if (entity.z < boundaryObstacleRadius && Math.abs(entity.z) > 0) {
            avoidZ += 1 / entity.z;
        } else if (distZ < boundaryObstacleRadius && distZ > 0) {
            avoidZ -= 1 / distZ;
        }

        return [avoidX, avoidY, avoidZ];
    }
}