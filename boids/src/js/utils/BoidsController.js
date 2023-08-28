import Entity from './Entity.js';
import Grid from './Grid.js'

export default class BoidsController {
    constructor(boundary=[500,500,500], subDivisionCount=1) {
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
    }

    addFlockEntity(entity) {
        this.grid.addEntity(entity);
        this.flockEntities.push(entity);
    }

    getFlockEntities() {
        return this.flockEntities;
    }

    addObstacleEntity(entity) {
        this.grid.addEntity(entity);
        this.obstacleEntities.push(entity);
    }

    getObstacleEntities() {
        return this.obstacleEntities;
    }

    getBoundary() {
        return this.boundary;
    }

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
            if (mouseOnScreen && avoidMouse && distance <= this.mouseRadius) {
                entity.addVelocity(this.aligmentWeight * this.scatterFactor * aligmentVel[0], this.aligmentWeight * this.scatterFactor * aligmentVel[1], this.aligmentWeight * this.scatterFactor * aligmentVel[2]);
                entity.addVelocity(this.cohesionWeight * this.scatterFactor * cohVel[0], this.cohesionWeight * this.scatterFactor * cohVel[1], this.cohesionWeight * this.scatterFactor * cohVel[2]);
                entity.addVelocity(50 * this.separationWeight * this.scatterFactor * sepVel[0], 50 * this.separationWeight * this.scatterFactor * sepVel[1], 50 * this.separationWeight * this.scatterFactor * sepVel[2]);
                
            } else {
                const vx = this.aligmentWeight*aligmentVel[0] + this.cohesionWeight*cohVel[0] +
                        50*this.separationWeight*sepVel[0] + 100*obsVel[0];
                const vy = this.aligmentWeight*aligmentVel[1] + this.cohesionWeight*cohVel[1] +
                            50*this.separationWeight*sepVel[1] + 100*obsVel[1];
                const vz = this.aligmentWeight*aligmentVel[2] + this.cohesionWeight*cohVel[2] +
                            50*this.separationWeight*sepVel[2] + 100*obsVel[2];
                entity.addVelocity(vx, vy, vz);
            }
            
            entity.move(this.maxEntitySpeed, ...this.boundary);
        }
    }

    computeAlignment(entity) {
        let aligmentX = 0;
        let aligmentY = 0;
        let aligmentZ = 0;
        let neighborCount = 0;

        this.grid.getEntitiesInCube(entity.x, entity.y, entity.z, this.aligmentRadius, (currentEntity) => {
            if(currentEntity != entity &&
               currentEntity.getType() == Entity.FLOCK_ENTITY &&
               entity.getDistance(currentEntity) < this.aligmentRadius) {
                neighborCount++;
                aligmentX += currentEntity.vx;
                aligmentY += currentEntity.vy;
                aligmentZ += currentEntity.vz;
            }
        });

        if(neighborCount > 0)
        {
            aligmentX /= neighborCount;
            aligmentY /= neighborCount;
            aligmentZ /= neighborCount;
            const aligmentMag = Math.sqrt((aligmentX*aligmentX)+(aligmentY*aligmentY)+(aligmentZ*aligmentZ));
            if(aligmentMag > 0) {
                aligmentX /= aligmentMag;
                aligmentY /= aligmentMag;
                aligmentZ /= aligmentMag;
            }
        }

        return [aligmentX, aligmentY, aligmentZ];
    }

    computeCohesion(entity) {
        let cohX = 0;
        let cohY = 0;
        let cohZ = 0;
        let neighborCount = 0;

        this.grid.getEntitiesInCube(entity.x, entity.y, entity.z, this.cohesionRadius, (currentEntity) => {
            if(currentEntity != entity &&
               currentEntity.getType() == Entity.FLOCK_ENTITY &&
               entity.getDistance(currentEntity) < this.cohesionRadius) {
                neighborCount++;
                cohX += currentEntity.x;
                cohY += currentEntity.y;
                cohZ += currentEntity.z;
            }
        });

        if(neighborCount > 0)
        {
            cohX /= neighborCount;
            cohY /= neighborCount;
            cohZ /= neighborCount;

            cohX = cohX - entity.x;
            cohY = cohY - entity.y;
            cohZ = cohZ - entity.z;

            var cohMag = Math.sqrt((cohX*cohX)+(cohY*cohY)+(cohZ*cohZ));
            if(cohMag > 0) {
                cohX /= cohMag;
                cohY /= cohMag;
                cohZ /= cohMag;
            }
        }

        return [cohX, cohY, cohZ];
    }

    computeSeparation(entity) {
        let sepX = 0;
        let sepY = 0;
        let sepZ = 0;
        let neighborCount = 0;

        this.grid.getEntitiesInCube(entity.x, entity.y, entity.z, this.separationRadius, (currentEntity) => {
            let distance = entity.getDistance(currentEntity);
            if(distance <= 0) {
                distance = 0.01
            }
            
            if(currentEntity != entity &&
               currentEntity.getType() == Entity.FLOCK_ENTITY &&
               distance < this.separationRadius) {
                neighborCount++;
                const sx = entity.x - currentEntity.x;
                const sy = entity.y - currentEntity.y;
                const sz = entity.z - currentEntity.z;
                sepX += (sx/distance)/distance;
                sepY += (sy/distance)/distance;
                sepZ += (sz/distance)/distance;
            }
        });

        return [sepX, sepY, sepZ];
    }

    computeObstacles(entity) {
        let avoidX = 0;
        let avoidY = 0;
        let avoidZ = 0;

        this.grid.getEntitiesInCube(entity.x, entity.y, entity.z, this.obstacleRadius, (currentObstacle) => {
            const distance = entity.getDistance(currentObstacle);
            if(distance > 0 &&
               currentObstacle.getType() == Entity.OBSTACLE_ENTITY &&
               distance < this.obstacleRadius) {
                const ox = entity.x - currentObstacle.x;
                const oy = entity.y - currentObstacle.y;
                const oz = entity.z - currentObstacle.z;
                avoidX += (ox/distance)/distance;
                avoidY += (oy/distance)/distance;
                avoidZ += (oz/distance)/distance;
            }
        });

        // avoid boundary limits
        const boundaryObstacleRadius = this.obstacleRadius/4;
        const distX = this.boundary[0] - entity.x;
        const distY = this.boundary[1] - entity.y;
        const distZ = this.boundary[2] - entity.z;
        if(entity.x < boundaryObstacleRadius && Math.abs(entity.x) > 0) {
            avoidX += 1/entity.x;
        } else if(distX < boundaryObstacleRadius && distX > 0) {
            avoidX -= 1/distX;
        }
        if(entity.y < boundaryObstacleRadius && Math.abs(entity.y) > 0) {
            avoidY += 1/entity.y;
        } else if(distY < boundaryObstacleRadius && distY > 0) {
            avoidY -= 1/distY;
        }
        if(entity.z < boundaryObstacleRadius && Math.abs(entity.z) > 0) {
            avoidZ += 1/entity.z;
        } else if(distZ < boundaryObstacleRadius && distZ > 0) {
            avoidZ -= 1/distZ;
        }

        return [avoidX, avoidY, avoidZ];
    }
}