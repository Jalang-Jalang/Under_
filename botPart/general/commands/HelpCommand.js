const Discord = require('discord.js');

class HelpCommand extends require('../../../Command.js'){

    constructor() {
        super(["help","h"])
    }

    execute(alias, params, user, server){
    
    }
}

module.exports.getInstance = () => {
    return new HelpCommand()
}