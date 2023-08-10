var roleHarvester = require('role.harvester');
var roleBuilder = require('role.builder');
var roleUpgrader = require('role.upgrader');
var roleAttacker = require('role.attacker');

const bodyTemplates = {
    harvester: {
        300: ['WORK', 'CARRY', 'MOVE'],
        550: ['WORK', 'WORK', 'CARRY', 'MOVE', 'MOVE'],
        800: ['WORK', 'WORK', 'WORK', 'CARRY', 'MOVE', 'MOVE', 'MOVE'],
        1300: ['WORK', 'WORK', 'WORK', 'WORK', 'CARRY', 'CARRY', 'MOVE', 'MOVE', 'MOVE', 'MOVE']
    },
    builder: {
        300: ['WORK', 'CARRY', 'MOVE'],
        550: ['WORK', 'CARRY', 'CARRY', 'MOVE', 'MOVE'],
        800: ['WORK', 'WORK', 'CARRY', 'CARRY', 'MOVE', 'MOVE', 'MOVE'],
        1300: ['WORK', 'WORK', 'WORK', 'CARRY', 'CARRY', 'MOVE', 'MOVE', 'MOVE', 'MOVE']
    },
    upgrader: {
        300: ['WORK', 'CARRY', 'MOVE'],
        550: ['WORK', 'WORK', 'CARRY', 'MOVE', 'MOVE'],
        800: ['WORK', 'WORK', 'CARRY', 'CARRY', 'MOVE', 'MOVE'],
        1300: ['WORK', 'WORK', 'WORK', 'CARRY', 'CARRY', 'MOVE', 'MOVE', 'MOVE']
    }
};

function getBestBody(role, energyAvailable) {
    let template = bodyTemplates[role];
    let chosenBody = [];
    for (let energy of [1300, 800, 550, 300]) {
        if (energyAvailable >= energy) {
            chosenBody = template[energy];
            break;
        }
    }
    return chosenBody;
}

// Task Management Functions

function updateTasks() {
    Memory.tasks = Memory.tasks || {};
    Memory.tasks.sources = {};
    Memory.tasks.constructionSites = [];

    const sources = Game.spawns['Spawn1'].room.find(FIND_SOURCES);
    for (let source of sources) {
        Memory.tasks.sources[source.id] = {assigned: 0, max: 2};  // max 2 harvesters per source
    }

    const sites = Game.spawns['Spawn1'].room.find(FIND_CONSTRUCTION_SITES);
    for (let site of sites) {
        Memory.tasks.constructionSites.push(site.id);
    }
}

function assignTask(creep) {
    const hostileZone = Memory.hostileZone;
    const isHostile = hostileZone && 
                      creep.room.name === hostileZone.roomName && 
                      creep.pos.isNearTo(hostileZone.x, hostileZone.y) && 
                      Game.time < hostileZone.endTick;

    if (isHostile) {
        // If a creep is near a hostile zone, we don't want to assign it a task there.
        return;
    }

    // Harvester task assignment
    if (creep.memory.role === 'harvester') {
        for (let id in Memory.tasks.sources) {
            if (Memory.tasks.sources[id].assigned < Memory.tasks.sources[id].max) {
                creep.memory.task = {type: 'harvest', target: id};
                Memory.tasks.sources[id].assigned++;
                return;
            }
        }
    }

    // Builder task assignment
    if (creep.memory.role === 'builder' && Memory.tasks.constructionSites.length) {
        creep.memory.task = {type: 'build', target: Memory.tasks.constructionSites.pop()};
        return;
    }

    // Upgrader task assignment
    if (creep.memory.role === 'upgrader') {
        const controller = creep.room.controller;
        if (controller && controller.my && controller.level < 8) {
            creep.memory.task = {type: 'upgrade', target: controller.id};
            return;
        }
    }

    // Attacker task assignment (for simplicity, we'll make them target the nearest hostile)
    if (creep.memory.role === 'attacker') {
        const hostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (hostile) {
            creep.memory.task = {type: 'attack', target: hostile.id};
            return;
        }
    }

    // If no task was assigned, set to idle
    if (!creep.memory.task) {
        creep.memory.task = {type: 'idle'};
    }
}

function spawnCreeps() {
    const spawn = Game.spawns['Spawn1'];
    const availableEnergy = spawn.room.energyAvailable;
    const totalEnergyCapacity = spawn.room.energyCapacityAvailable;
    const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role === 'harvester');

    let body = [];
    let role = '';

    if (harvesters.length < 2) {  // Ensure we always have harvesters
        role = 'harvester';
        if (availableEnergy >= 300) {
            body = [WORK, WORK, CARRY, MOVE];
        } else {
            body = [WORK, CARRY, MOVE];
        }
    } else if (availableEnergy >= 150) {
        const builders = _.filter(Game.creeps, (creep) => creep.memory.role === 'builder');
        const upgraders = _.filter(Game.creeps, (creep) => creep.memory.role === 'upgrader');
        const attackers = _.filter(Game.creeps, (creep) => creep.memory.role === 'attacker');

        if (builders.length < 2) {
            role = 'builder';
        } else if (upgraders.length < 2) {
            role = 'upgrader';
        } else if (attackers.length < 1) {
            role = 'attacker';
        }

        if (role) {
            if (totalEnergyCapacity >= 550) {
                body = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE];
            } else if (totalEnergyCapacity >= 400) {
                body = [WORK, WORK, CARRY, CARRY, MOVE, MOVE];
            } else {
                body = [WORK, CARRY, CARRY, MOVE];
            }
        }
    }

    if (body.length && role) {
        spawn.spawnCreep(body, `${role}_${Game.time}`, {
            memory: {role: role, working: false, task: null}
        });
    }
}

// Main loop
module.exports.loop = function() {
    // Cleanup for dead creeps
    for(let name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }

    updateTasks();

    for(let name in Game.creeps) {
        let creep = Game.creeps[name];
        if (!creep.memory.task || creep.memory.task.type === 'idle') {
            assignTask(creep);
        }
    }

    // Run each creep role script
    for(let name in Game.creeps) {
        let creep = Game.creeps[name];
        switch (creep.memory.role) {
            case 'harvester':
                roleHarvester.run(creep);
                break;
            case 'builder':
                roleBuilder.run(creep);
                break;
            case 'upgrader':
                roleUpgrader.run(creep);
                break;
            case 'attacker':
                roleAttacker.run(creep);
                break;
            // ... Additional roles can be added here...
        }
    }

    // Tower Logic
    const towers = Game.rooms[Game.spawns['Spawn1'].room.name].find(FIND_MY_STRUCTURES, {
        filter: {structureType: STRUCTURE_TOWER}
    });
    for(let tower of towers) {
        const closestDamagedStructure = tower.pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if (closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }
        
        const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (closestHostile) {
            tower.attack(closestHostile);
        }
    }
    
    // Mark hostile zones
    for(let name in Game.creeps) {
        let creep = Game.creeps[name];
        if (creep.hits < creep.hitsMax) {
            const hostilePos = creep.pos;
            Memory.hostileZone = {
                x: hostilePos.x,
                y: hostilePos.y,
                roomName: hostilePos.roomName,
                endTick: Game.time + 400
            };
        }
    }

    spawnCreeps();
}
