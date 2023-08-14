
const roleHarvester = require('role.harvester');
const roleUpgrader = require('role.upgrader');
const roleBuilder = require('role.builder');
const roleDefender = require('role.defender');
const roleRepairer = require('role.repairer');
const utils = require('utils');

module.exports.loop = function () {
    utils.cleanupMemory();

    const spawn = Game.spawns['Spawn1'];

    // Dynamic role assignment based on room needs
    for(let name in Game.creeps) {
        var creep = Game.creeps[name];
        switch (creep.memory.role) {
            case 'harvester':
                roleHarvester.run(creep);
                break;
            case 'upgrader':
                roleUpgrader.run(creep);
                break;
            case 'builder':
                roleBuilder.run(creep);
                break;
            case 'defender':
                roleDefender.run(creep);
                break;
            case 'repairer':
                roleRepairer.run(creep);
                break;
        }
    }
    
    utils.manageCreeps(spawn);
}
