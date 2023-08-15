
var utils = {

    cleanupMemory: function() {
        for (let name in Memory.creeps) {
            if (Game.creeps[name] === undefined) {
                delete Memory.creeps[name];
            }
        }
    },

    manageCreeps: function(spawn) {
        var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
        var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
        var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
        var defenders = _.filter(Game.creeps, (creep) => creep.memory.role == 'defender');
        var repairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer');

        if (harvesters.length < 2) {
            this.spawnCreep(spawn, [WORK, CARRY, MOVE], 'harvester');
        } else if (upgraders.length < 1) {
            this.spawnCreep(spawn, [WORK, CARRY, MOVE], 'upgrader');
        } else if (builders.length < 1) {
            this.spawnCreep(spawn, [WORK, CARRY, MOVE], 'builder');
        } else if (defenders.length < 1) {
            this.spawnCreep(spawn, [ATTACK, ATTACK, MOVE, MOVE], 'defender');
        } else if (repairers.length < 1) {
            this.spawnCreep(spawn, [WORK, CARRY, MOVE], 'repairer');
        }
    },

    spawnCreep: function(spawn, body, role) {
        var newName = role + Game.time;
        var memory = { role: role, working: false };

        // Explicit memory initialization based on role
        switch (role) {
            case 'harvester':
            case 'upgrader':
                memory.upgrading = false;
                memory.harvesting = true;
                break;
            case 'builder':
                memory.building = false;
                break;
            default:
                break;
        }

        spawn.spawnCreep(body, newName, { memory: memory });
    }
};

module.exports = utils;
