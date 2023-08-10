
module.exports = {
    run: function(creep) {
        // Switching between working and harvesting
        if (creep.memory.working && creep.carry.energy === 0) {
            creep.memory.working = false;
        }
        if (!creep.memory.working && creep.carry.energy === creep.carryCapacity) {
            creep.memory.working = true;
        }

        // Priority hierarchy for building
        const PRIORITY_STRUCTURES = [
            STRUCTURE_EXTENSION,
            STRUCTURE_ROAD,
            STRUCTURE_TOWER,
            STRUCTURE_STORAGE,
            STRUCTURE_WALL,
            STRUCTURE_RAMPART
            // ... add more structures as required
        ];

        // If working, find the most important construction site
        if (creep.memory.working) {
            let target = null;
            for (let type of PRIORITY_STRUCTURES) {
                if (!target) {
                    target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {
                        filter: (site) => site.structureType === type
                    });
                }
            }

            // Build or move to the construction site
            if (target) {
                if (creep.build(target) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            } else {
                // If no construction sites, repair structures
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: s => s.hits < s.hitsMax && s.structureType !== STRUCTURE_WALL
                });
                if (target) {
                    if (creep.repair(target) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                }
            }
        } else {
            // Similar logic to the original for harvesting energy...
        }

        // If the creep is under attack, move to a safe location
        if (creep.hits < creep.hitsMax) {
            creep.moveTo(creep.room.controller);  // Move to a safer location
        }
    }
}
