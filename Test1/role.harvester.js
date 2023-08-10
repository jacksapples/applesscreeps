
module.exports = {
    run: function(creep) {
        // Switching between working and harvesting
        if (creep.memory.working && creep.carry.energy === 0) {
            creep.memory.working = false;
            delete creep.memory.sourceId;  // Clear the source when the creep has used up all its energy
        }
        if (!creep.memory.working && creep.carry.energy === creep.carryCapacity) {
            creep.memory.working = true;
        }

        // If working, transfer energy based on priority
        if (creep.memory.working) {
            let target = null;

            // Priority: Spawns and extensions
            if (!target) {
                target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    filter: s => (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) &&
                                 s.energy < s.energyCapacity
                });
            }

            // Priority: Towers
            if (!target) {
                target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    filter: s => s.structureType == STRUCTURE_TOWER && s.energy < s.energyCapacity
                });
            }

            // Priority: Storage
            if (!target) {
                target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    filter: s => s.structureType == STRUCTURE_STORAGE && _.sum(s.store) < s.storeCapacity
                });
            }

            // Priority: Containers
            if (!target) {
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: s => s.structureType == STRUCTURE_CONTAINER && _.sum(s.store) < s.storeCapacity
                });
            }

            // Transfer energy or move closer to the target
            if (target) {
                if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            } else {
                // Fallback: Upgrade the controller if there's absolutely nowhere to put energy
                if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
            }
        } else {
            // Harvesting logic extracted from the previous content
            const pathOpts = {
                costCallback: function(roomName, costMatrix) {
                    if (Memory.hostileZone && Memory.hostileZone.roomName === roomName && Game.time < Memory.hostileZone.endTick) {
                        costMatrix.set(Memory.hostileZone.x, Memory.hostileZone.y, 255);
                    }
                }
            };
            const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE, {
                filter: (s) => {
                    return !Memory.hostileZone || (s.pos.x !== Memory.hostileZone.x && s.pos.y !== Memory.hostileZone.y);
                },
                pathOpts
            });

            if (source) {
                if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                }
            }
        }

        // If the creep is under attack, move to a safe location
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
