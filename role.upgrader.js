
var utils = require('utils');

module.exports = {
    run: function(creep) {
        try {
            if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
                creep.memory.upgrading = false;
            }
            if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
                creep.memory.upgrading = true;
            }

            if(creep.memory.upgrading) {
                if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                    this.buildRoad(creep);
                }
            } else {
                var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                    this.buildRoad(creep);
                }
            }
        } catch (error) {
            console.log('Error in upgrader role for creep ' + creep.name + ':', error.stack);
        }
    },

    buildRoad: function(creep) {
        var atPos = creep.pos.lookFor(LOOK_STRUCTURES);
        var roadFound = false;
        for (let i in atPos) {
            if (atPos[i].structureType == STRUCTURE_ROAD) {
                roadFound = true;
                break;
            }
        }
        if (!roadFound) {
            creep.pos.createConstructionSite(STRUCTURE_ROAD);
        }
    }
    
}