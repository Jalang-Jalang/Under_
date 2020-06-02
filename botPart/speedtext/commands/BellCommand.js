const Discord = require('discord.js');

class BellCommand extends require('../../../Command.js'){

    constructor() {
        super("bell");
    }

    execute(alias, params, user, server){
        
    }
}

module.exports.getInstance = () => {
    return new BellCommand()
}