
var utils = require('utils');

module.exports = {
    run: function(creep) {
        if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
        }
        if(!creep.memory.building && creep.store.getFreeCapacity() == 0) {
            creep.memory.building = true;
        }

        if(creep.memory.building) {
            var target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            if(target) {
                if(creep.build(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                    this.buildRoad(creep);
                }
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
    
}