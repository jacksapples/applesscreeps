
module.exports = {
    run: function(creep) {
        if (!creep.memory.targetRoom) {
            // Assign a random room for the scout to explore
            var exits = Game.map.describeExits(creep.room.name);
            var exitArray = Object.values(exits);
            creep.memory.targetRoom = exitArray[Math.floor(Math.random() * exitArray.length)];
        }
        
        // Move to the target room
        if (creep.room.name != creep.memory.targetRoom) {
            var exitDir = Game.map.findExit(creep.room.name, creep.memory.targetRoom);
            var exit = creep.pos.findClosestByRange(exitDir);
            creep.moveTo(exit);
        } else {
            creep.moveTo(25, 25);  // Move towards the center of the room
        }
    }
};
