
var utils = require('utils');

module.exports = {
    run: function(creep) {
        if(creep.memory.harvesting && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.harvesting = false;
        }
        if(!creep.memory.harvesting && creep.store.getFreeCapacity() == 0) {
            creep.memory.harvesting = true;
        }

        if(creep.memory.harvesting) {
            var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) &&
                              s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            });
            if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
                this.buildRoad(creep);
            }
        } else {
            var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
                this.buildRoad(creep);
            }
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
};
