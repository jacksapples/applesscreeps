
const MIN_HARVESTERS = 3;
const MIN_UPGRADERS = 2;
const MIN_BUILDERS = 2;
const MIN_REPAIRERS = 1;
const MIN_DEFENDERS = 1;

module.exports = {
    cleanupMemory: function() {
        for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }
    },

    manageCreeps: function(spawn) {
        var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
        var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
        var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
        var defenders = _.filter(Game.creeps, (creep) => creep.memory.role == 'defender');
        var repairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer');

        if(harvesters.length < MIN_HARVESTERS) {
            this.spawnCreep(spawn, [WORK, CARRY, MOVE], 'harvester');
        } else if(upgraders.length < MIN_UPGRADERS) {
            this.spawnCreep(spawn, [WORK, CARRY, MOVE], 'upgrader');
        } else if(builders.length < MIN_BUILDERS) {
            this.spawnCreep(spawn, [WORK, CARRY, MOVE], 'builder');
        } else if(defenders.length < MIN_DEFENDERS) {
            this.spawnCreep(spawn, [TOUGH, ATTACK, MOVE], 'defender');
        } else if(repairers.length < MIN_REPAIRERS) {
            this.spawnCreep(spawn, [WORK, CARRY, MOVE], 'repairer');
        }
    },

    spawnCreep: function(spawn, body, role) {
        var newName = role.charAt(0).toUpperCase() + role.slice(1) + Game.time;
        spawn.spawnCreep(body, newName, {memory: {role: role}});
    }
};

