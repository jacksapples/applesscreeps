
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

        if(harvesters.length < 2) {
            var newName = 'Harvester' + Game.time;
            spawn.spawnCreep([WORK, CARRY, MOVE], newName, {memory: {role: 'harvester'}});
        } else if(upgraders.length < 2) {
            var newName = 'Upgrader' + Game.time;
            spawn.spawnCreep([WORK, CARRY, MOVE], newName, {memory: {role: 'upgrader'}});
        } else if(builders.length < 2) {
            var newName = 'Builder' + Game.time;
            spawn.spawnCreep([WORK, CARRY, MOVE], newName, {memory: {role: 'builder'}});
        } else if(defenders.length < 1) {
            var newName = 'Defender' + Game.time;
            spawn.spawnCreep([TOUGH, ATTACK, MOVE], newName, {memory: {role: 'defender'}});
        }
    }
};
