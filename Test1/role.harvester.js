module.exports = {
    run: function(creep) {
        // Switching between working and harvesting
        if (creep.memory.working && creep.carry.energy === 0) {
            creep.memory.working = false;
        }
        if (!creep.memory.working && creep.carry.energy === creep.carryCapacity) {
            creep.memory.working = true;
        }

        // If working, transfer energy
        if (creep.memory.working) {
            // First, prioritize transferring to extensions
            const extensions = creep.room.find(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_EXTENSION && structure.energy < structure.energyCapacity;
                }
            });

            if (extensions.length) {
                if (creep.transfer(extensions[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(extensions[0]);
                }
            } else {
                // If extensions are full or not available, transfer to other structures
                const targets = creep.room.find(FIND_MY_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType === STRUCTURE_SPAWN ||
                                structure.structureType === STRUCTURE_TOWER ||
                                structure.structureType === STRUCTURE_STORAGE) && structure.energy < structure.energyCapacity;
                    }
                });

                if (targets.length) {
                    targets.sort((a, b) => a.energy - b.energy);  // Ascending sort by energy content
                    if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0]);
                    }
                }
            }
        } else {
            // If the harvester doesn't have an assigned source or it's time to re-evaluate, find one
            if (!creep.memory.sourceId || Game.time % 100 === 0) {
                const sources = creep.room.find(FIND_SOURCES_ACTIVE, {
                    filter: (source) => {
                        return !Memory.hostileZone || (source.pos.x !== Memory.hostileZone.x && source.pos.y !== Memory.hostileZone.y);
                    }
                });

                // Find the source with the fewest assigned harvesters
                let minHarvesters = Infinity;
                let bestSource = null;
                for (let source of sources) {
                    const assignedHarvesters = _.filter(Game.creeps, c => c.memory.sourceId === source.id && c.memory.role === 'harvester');
                    if (assignedHarvesters.length < minHarvesters) {
                        minHarvesters = assignedHarvesters.length;
                        bestSource = source;
                    }
                }

                // Assign the best source to the harvester
                if (bestSource) {
                    creep.memory.sourceId = bestSource.id;
                }
            }

            // Now, make the harvester go to its assigned source
            const source = Game.getObjectById(creep.memory.sourceId);
            if (source && creep.harvest(source) === ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
        }

        // If the creep is under attack, move to a safe location and mark the current position as hostile
        if (creep.hits < creep.hitsMax) {
            const hostilePos = creep.pos;
            Memory.hostileZone = {
                x: hostilePos.x,
                y: hostilePos.y,
                roomName: hostilePos.roomName,
                endTick: Game.time + 400
            };
            creep.moveTo(creep.room.controller);  // Move to a safer location
        }
    }
}
