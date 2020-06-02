const Discord = require('discord.js');

class ExpCommand extends require('../../../Command.js'){

    constructor() {
        super(["exp","express"]);
    }

    execute(alias, params, user, server){
            
    }
}

module.exports.getInstance = () => {
    return new ExpCommand()
}