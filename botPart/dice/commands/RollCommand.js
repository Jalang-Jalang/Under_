const Discord = require('discord.js');

class RollCommand extends require('../../../Command.js'){

    constructor() {
        super(["roll","r","rs"])
    }

    execute(alias, params, user, server){
    
    }
}

module.exports.getInstance = () => {
    return new RollCommand()
}