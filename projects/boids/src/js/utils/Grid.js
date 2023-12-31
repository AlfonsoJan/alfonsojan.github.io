
/**
 * @module Grid 
 * Grid class creates cubic grid for spatial partitioning.
 * This helps lookups to be performed faster for nearby entities.
 * More information can be found here:
 * http://gameprogrammingpatterns.com/spatial-partition.html
 */
export default class Grid {
    /**
     * Create a new Grid instance
     * @param {number} worldSize - The size of the world in all dimensions
     * @param {number} cellSize - The size of each grid cell
     */
    constructor(worldSize, cellSize) {
        this.worldSize = worldSize;
        this.cellSize = cellSize;
        this.cellRowCount = (this.worldSize / this.cellSize)|0;
        
        this.cellCount = this.cellRowCount*this.cellRowCount*this.cellRowCount;
        this.entityList = [];
        for (let i = 0; i < this.cellCount; i++) {
            this.entityList[i] = [];
        }
    }

    /**
     * Get the grid index for a given position
     * @param {number} x - The x-coordinate of the position
     * @param {number} y - The y-coordinate of the position
     * @param {number} z - The z-coordinate of the position
     * @returns {number} The index of the grid cell
     */
    getGridIndex(x, y, z) {
        let cellX = (x / this.cellSize)|0;
        let cellY = (y / this.cellSize)|0;
        let cellZ = (z / this.cellSize)|0;

        if (cellX < 0) {
            cellX = 0;
        } else if(cellX > this.cellRowCount-1) {
            cellX = this.cellRowCount - 1;
        }

        if (cellY < 0) {
            cellY = 0;
        } else if(cellY > this.cellRowCount-1) {
            cellY = this.cellRowCount - 1;
        }

        if (cellZ < 0) {
            cellZ = 0;
        } else if(cellZ > this.cellRowCount-1) {
            cellZ = this.cellRowCount - 1;
        }

        let index = cellX + cellY * this.cellRowCount + cellZ * this.cellRowCount * this.cellRowCount;
        return index|0;
    }

    /**
     * Add an entity to the grid
     * @param {Entity} entity - The entity to add
     */
    addEntity(entity) {
        const index = this.getGridIndex(entity.x, entity.y, entity.z)|0;
        entity.setGrid(this);
        this.entityList[index].push(entity);
    }
    /**
     * Move an entity to a new position within the grid
     * @param {Entity} entity - The entity to move
     * @param {number} newX - The new x-coordinate
     * @param {number} newY - The new y-coordinate
     * @param {number} newZ - The new z-coordinate
     */
    moveEntity(entity, newX, newY, newZ) {
        const oldIndex = this.getGridIndex(entity.x, entity.y, entity.z)|0;
        const newIndex = this.getGridIndex(newX, newY, newZ)|0;

        if (oldIndex == newIndex) {
            entity.x = newX;
            entity.y = newY;
            entity.z = newZ;
            return;
        }
        const gridEntities = this.entityList[oldIndex];
        const entityIndex = gridEntities.indexOf(entity);
        if(entityIndex == -1) {
            throw("moveEntity() can not find the entity to be removed!");
        }
        else {
            gridEntities.splice(entityIndex, 1);
        }
        entity.x = newX;
        entity.y = newY;
        entity.z = newZ;
        this.entityList[newIndex].push(entity);
    };

    /**
     * Get entities within a cubic region centered at the specified origin
     * @param {number} originX - The x-coordinate of the origin
     * @param {number} originY - The y-coordinate of the origin
     * @param {number} originZ - The z-coordinate of the origin
     * @param {number} size - The size of the cubic region
     * @param {Function} callback - A callback function to process each entity
     */
    getEntitiesInCube(originX, originY, originZ, size, callback) {
        const start = this.getGridIndex(originX - size, originY - size, originZ - size); // top left
        const topEnd = this.getGridIndex(originX + size, originY - size, originZ - size); // top right
        const bottomStart = this.getGridIndex(originX - size, originY + size, originZ - size); // bottom left
        const backStart = this.getGridIndex(originX + size, originY + size, originZ + size); // back left

        const index = start;
        const width = topEnd - start + 1;
        const height = (((bottomStart - start)/this.cellRowCount) + 1)|0;
        const depth = (((backStart - start)/(this.cellRowCount*this.cellRowCount)) + 1)|0;
        for (let d = 0; d < depth; d++) {
            for (let h = 0; h < height; h++) {
                for (let w = 0; w < width; w++) {
                    const currentIndex = index + (d * this.cellRowCount * this.cellRowCount) + (h * this.cellRowCount) + w;
                    if (currentIndex >= this.cellCount) {
                        continue;
                    }

                    const currentItems = this.entityList[currentIndex];
                    const curLen = currentItems.length;
                    for (let i = 0; i < curLen; i++) {
                        const item = currentItems[i]
                        if (item !== undefined && item.x >= originX - size && item.x <= originX + size && item.y >= originY - size && item.y <= originY + size && item.z >= originZ - size && item.z <= originZ + size) {
                            callback(item);
                        }
                    }
                }
            }
        }
    };
}