
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
            this.spawnCreep(spawn, this.getBodyParts('harvester'), 'harvester');
        } else if(upgraders.length < MIN_UPGRADERS) {
            this.spawnCreep(spawn, this.getBodyParts('upgrader'), 'upgrader');
        } else if(builders.length < MIN_BUILDERS) {
            this.spawnCreep(spawn, this.getBodyParts('builder'), 'builder');
        } else if(defenders.length < MIN_DEFENDERS) {
            this.spawnCreep(spawn, this.getBodyParts('defender'), 'defender');
        } else if(repairers.length < MIN_REPAIRERS) {
            this.spawnCreep(spawn, this.getBodyParts('repairer'), 'repairer');
        }
    },

    spawnCreep: function(spawn, body, role) {
        var newName = role.charAt(0).toUpperCase() + role.slice(1) + Game.time;
        spawn.spawnCreep(body, newName, {memory: {role: role}});
    },

    getBodyParts: function(role) {
        var body = [];
        var availableEnergy = Game.spawns['Spawn1'].room.energyCapacityAvailable;

        if (role === 'harvester' || role === 'upgrader') {
            var numOfParts = Math.floor(availableEnergy / 200);
            for (let i = 0; i < numOfParts; i++) {
                body.push(WORK);
                body.push(CARRY);
                body.push(MOVE);
            }
        } else if (role === 'builder' || role === 'repairer') {
            var numOfParts = Math.floor(availableEnergy / 200);
            for (let i = 0; i < numOfParts; i++) {
                body.push(WORK);
                body.push(CARRY);
                body.push(MOVE);
            }
        } else if (role === 'defender') {
            var numOfParts = Math.floor(availableEnergy / 150);
            for (let i = 0; i < numOfParts; i++) {
                body.push(TOUGH);
                body.push(ATTACK);
                body.push(MOVE);
            }
        }
        return body;
    }
};

