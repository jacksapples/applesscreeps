module.exports = {
    run: function(creep) {
        // Switching between working and harvesting
        if (creep.memory.working && creep.carry.energy === 0) {
            creep.memory.working = false;
        }
        if (!creep.memory.working && creep.carry.energy === creep.carryCapacity) {
            creep.memory.working = true;
        }

        // If working, find the most important construction site
        if (creep.memory.working) {
            // First, prioritize building extensions
            let targets = creep.room.find(FIND_CONSTRUCTION_SITES, {
                filter: (site) => site.structureType === STRUCTURE_EXTENSION
            });

            // If no extensions to build, find other construction sites
            if (targets.length === 0) {
                targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            }

            // Build or move to the construction site
            if (targets.length) {
                const pathOpts = {
                    costCallback: function(roomName, costMatrix) {
                        if (Memory.hostileZone && Memory.hostileZone.roomName === roomName && Game.time < Memory.hostileZone.endTick) {
                            costMatrix.set(Memory.hostileZone.x, Memory.hostileZone.y, 255);
                        }
                    }
                };
                if (creep.build(targets[0], pathOpts) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], pathOpts);
                }
            } else {
                // If no other construction sites, repair structures
                let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: s => s.hits < s.hitsMax && s.structureType !== STRUCTURE_WALL
                });
                if (target) {
                    if (creep.repair(target) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                }
            }
        } else {
            // If not working, harvest from the best energy source
            const sources = creep.room.find(FIND_SOURCES_ACTIVE);
            sources.sort((a, b) => b.energy - a.energy);  // Descending sort by energy content
            const source = sources[0];

            const pathOpts = {
                costCallback: function(roomName, costMatrix) {
                    if (Memory.hostileZone && Memory.hostileZone.roomName === roomName && Game.time < Memory.hostileZone.endTick) {
                        costMatrix.set(Memory.hostileZone.x, Memory.hostileZone.y, 255);
                    }
                }
            };
            if (creep.harvest(source, pathOpts) === ERR_NOT_IN_RANGE) {
                creep.moveTo(source, pathOpts);
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
