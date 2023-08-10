module.exports = {
    run: function(creep) {
        // If there's a known hostile zone, prioritize it
        if (Memory.hostileZone && Game.time < Memory.hostileZone.endTick) {
            const targetPos = new RoomPosition(Memory.hostileZone.x, Memory.hostileZone.y, Memory.hostileZone.roomName);
            const hostiles = targetPos.findInRange(FIND_HOSTILE_CREEPS, 3);
            
            if (hostiles.length) {
                if (creep.attack(hostiles[0]) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(hostiles[0]);
                }
            } else {
                creep.moveTo(targetPos);
            }
            return; // Exit the function early if we're dealing with a hostile zone
        }

        // Default attacker behavior (seek out and destroy hostiles)
        const target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
        if (target) {
            if (creep.attack(target) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        } else {
            // If no hostiles found, patrol around the room controller or another strategic point
            creep.moveTo(creep.room.controller);
        }
    }
}
