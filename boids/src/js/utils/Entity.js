let idCounter = 0;

/**
 * @module Entity 
 * Entity class defines an entitiy model which has a position and a velocity.
 * Also it has some utiliy methods.
 */
export default class Entity {
    /**
     * Create a new Entity instance
     * @param {number} type - The type of the entity (FLOCK_ENTITY or OBSTACLE_ENTITY)
     * @param {number} x - The x-coordinate of the entity's position
     * @param {number} y - The y-coordinate of the entity's position
     * @param {number} z - The z-coordinate of the entity's position
     * @param {number} vx - The velocity along the x-axis
     * @param {number} vy - The velocity along the y-axis
     * @param {number} vz - The velocity along the z-axis
     */
    constructor(type, x = 0, y = 0, z = 0, vx = 0, vy = 0, vz = 0) {
        this.id = ++idCounter;
        this.type = type;
        this.x = x;
        this.y = y;
        this.z = z;
        this.vx = vx;
        this.vy = vy;
        this.vz = vz;
        this.grid = undefined;
        this.mesh = undefined;

        this.FLOCK_ENTITY = 1;
        this.OBSTACLE_ENTITY = 1;
    }

    setGrid(grid) {
        this.grid = grid;
    }

    /**
     * Get the type of the entity.
     * @returns {number} The type of the entity.
     */
    getType() {
        return this.type;
    }

    /**
     * Calculate the magnitude of the velocity.
     * @returns {number} The magnitude of the velocity.
     */
    getVelocity() {
        return Math.sqrt((this.vx * this.vx) + (this.vy * this.vy) + (this.vz * this.vz));
    }

    /**
     * Adjust the velocity if it exceeds the maximum velocity.
     * @param {number} maxVelocity - The maximum velocity.
     */
    checkVelocity(maxVelocity = 1) {
        const velocity = this.getVelocity();
        if(velocity > maxVelocity && velocity > 0) {
            this.vx = maxVelocity*this.vx/velocity;
            this.vy = maxVelocity*this.vy/velocity;
            this.vz = maxVelocity*this.vz/velocity;
        }
    }

    /**
     * Add a velocity vector to the entity's current velocity.
     * @param {number} vx - The velocity along the x-axis to be added.
     * @param {number} vy - The velocity along the y-axis to be added.
     * @param {number} vz - The velocity along the z-axis to be added.
     */
    addVelocity(vx, vy, vz) {
        this.vx += vx;
        this.vy += vy;
        this.vz += vz;
    }

    /**
     * Move the entity based on its velocity and ensure it stays within boundaries.
     * @param {number} maxVelocity - The maximum velocity.
     * @param {number} bx - The boundary along the x-axis.
     * @param {number} by - The boundary along the y-axis.
     * @param {number} bz - The boundary along the z-axis.
     */
    move(maxVelocity, bx, by, bz) {
        this.checkVelocity(maxVelocity);

        let nx = this.x + this.vx;
        let ny = this.y + this.vy;
        let nz = this.z + this.vz;

        nx = Math.max(0, nx);
        nx = Math.min(bx, nx);
        ny = Math.max(0, ny);
        ny = Math.min(by, ny);
        nz = Math.max(0, nz);
        nz = Math.min(bz, nz);
        
        this.grid.moveEntity(this, nx, ny, nz);
    }

    /**
     * Calculate the Euclidean distance between this entity and another entity.
     * @param {Entity} otherEntity - The other entity.
     * @returns {number} The distance between this entity and the other entity.
     */
    getDistance(otherEntity) {
        const dx = this.x - otherEntity.x;
        const dy = this.y - otherEntity.y;
        const dz = this.z - otherEntity.z;
        return Math.sqrt((dx * dx) + (dy * dy) + (dz * dz));
    }
}