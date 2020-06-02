const Discord = require('discord.js');

class PingCommand extends require('../../../Command.js'){

    constructor() {
        super("ping");
    }

    execute(alias, params, user, server){
        
    }
}

module.exports.getInstance = () => {
    return new PingCommand()
}