const commands = {
    "die": require('./botPart/general/commands/DieCommand.js').getInstance(),
    "help": require('./botPart/general/commands/HelpCommand.js').getInstance(),
    "ping": require('./botPart/general/commands/PingCommand.js').getInstance(),
    "bell": require('./botPart/speedtext/commands/BellCommand.js').getInstance(),
    "ding": require('./botPart/speedtext/commands/DingCommand.js').getInstance(),
    "exp": require('./botPart/dice/commands/ExpCommand.js').getInstance(),
    "roll": require('./botPart/dice/commands/RollCommand.js').getInstance()
}

module.exports.getCommand = (alias, params, user, server) => {
    for(let key in commands){
        let value = commands[key]
        console.log(value instanceof require('./Command.js'))
    }
}