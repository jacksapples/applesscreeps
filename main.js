
const roleHarvester = require('role.harvester');
const roleUpgrader = require('role.upgrader');
const roleBuilder = require('role.builder');
const roleDefender = require('role.defender');
const utils = require('utils');

module.exports.loop = function () {
    utils.cleanupMemory();

    const spawn = Game.spawns['Spawn1'];

    // Dynamic role assignment based on room needs
    for(let name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
        if(creep.memory.role == 'defender') {
            roleDefender.run(creep);
        }
    }
    
    utils.manageCreeps(spawn);
}
