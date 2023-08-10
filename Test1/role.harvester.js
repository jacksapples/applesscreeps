
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

        // If working, transfer energy
        if (creep.memory.working) {
            // Similar logic to the original for transferring energy...
        } else {
            // Use stored sourceId if available
            if (!creep.memory.sourceId) {
                // Find the closest active source that's not in a hostile zone
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
                    creep.memory.sourceId = source.id;
                }
            }

            // Now, make the harvester go to its assigned source
            const targetSource = Game.getObjectById(creep.memory.sourceId);
            if (targetSource && creep.harvest(targetSource) === ERR_NOT_IN_RANGE) {
                creep.moveTo(targetSource);
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
