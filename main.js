
const roleHarvester = require('role.harvester');
const roleUpgrader = require('role.upgrader');
const roleBuilder = require('role.builder');
const roleDefender = require('role.defender');
const roleRepairer = require('role.repairer');
const roleScout = require('role.scout');
const roleClaimer = require('role.claimer');
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
            case 'scout':
                roleScout.run(creep);
                break;
            case 'claimer':
                roleClaimer.run(creep);
                break;
        }
    }
    
    utils.manageCreeps(spawn);

    // Tower logic
    var towers = Game.rooms[spawn.room.name].find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_TOWER }
    });
    for (var tower of towers) {
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        } else {
            var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax
            });
            if(closestDamagedStructure) {
                tower.repair(closestDamagedStructure);
            }
        }
    }
    
    // Exploration logic: If no scout exists, spawn one
    var scouts = _.filter(Game.creeps, (creep) => creep.memory.role == 'scout');
    if (scouts.length < 1) {
        utils.spawnCreep(spawn, [MOVE], 'scout');
    }
    
    // Claiming logic: If a room has been identified for claiming and no claimer exists, spawn one
    var claimers = _.filter(Game.creeps, (creep) => creep.memory.role == 'claimer');
    if (Memory.targetClaimRoom && claimers.length < 1) {
        utils.spawnCreep(spawn, [CLAIM, MOVE], 'claimer');
    }
}
