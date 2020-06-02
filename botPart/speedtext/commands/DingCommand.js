const Discord = require('discord.js');

class DingCommand extends require('../../../Command.js'){

    constructor() {
        super("exp");
    }

    execute(alias, params, user, server){
        
    }
}

module.exports.getInstance = () => {
    return new DingCommand()
}