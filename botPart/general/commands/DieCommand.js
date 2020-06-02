const Discord = require('discord.js');

class DieCommand extends require('../../../Command.js'){

    constructor() {
        super("die")
    }

    execute(alias, params, user, server){    
    
    }
}

module.exports.getInstance = () => {
    return new DieCommand()
}