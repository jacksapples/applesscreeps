module.exports = {
    run: function(creep) {
        // Switch states if necessary
        if (creep.memory.upgrading && creep.carry.energy === 0) {
            creep.memory.upgrading = false;
        }
        if (!creep.memory.upgrading && creep.carry.energy === creep.carryCapacity) {
            creep.memory.upgrading = true;
        }

        // If upgrading, upgrade the controller
        if (creep.memory.upgrading) {
            if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        } else {
            // If not upgrading, find the closest source that's not in a hostile area and harvest energy
            const sources = creep.room.find(FIND_SOURCES_ACTIVE, {
                filter: (source) => {
                    return !Memory.hostileZone || (source.pos.x !== Memory.hostileZone.x && source.pos.y !== Memory.hostileZone.y);
                }
            });
            if (sources.length) {
                const source = creep.pos.findClosestByPath(sources);
                if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                }
            }
        }
    }
}
