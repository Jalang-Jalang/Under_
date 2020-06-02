const Discord = require("discord.js");
const Canvas = require('canvas');
const client = new Discord.Client();
const fs = require("fs");
const token = process.env.TOKEN;
const seed = Math.floor(Math.random() * 100000000);

const commandManager = require("./CommandManager.js")
commandManager.getCommand("", "", "", "")

const { prefix , owners , diceData } = require("./config.json")
const speedtexts = require("./textsData.json")

const syntax = {
  sum: {
    format: "$+$",
    args: 2,
    call: (a, b) => Array.from(Array(Math.max(a.split(",").length, b.split(",").length))).map((e, i) => (parseInt(a.split(",")[i]) || 0) + (parseInt(b.split(",")[i]) || 0))
  },
  diff: {
    format: "$-$",
    args: 2,
    call: (a, b) => Array.from(Array(Math.max(a.split(",").length, b.split(",").length))).map((e, i) => (parseInt(a.split(",")[i]) || 0) - (parseInt(b.split(",")[i]) || 0))
  },
  div: {
    format: "$/$",
    args: 2,
    call: (a, b) => Array.from(Array(Math.max(a.split(",").length, b.split(",").length))).map((e, i) => ((parseInt(a.split(",")[i]) || 0) / (parseInt(b.split(",")[i]) || 1)).toFixed(0))
  },
  mult: {
    format: "$*$",
    args: 2,
    call: (a, b) => Array.from(Array(Math.max(a.split(",").length, b.split(",").length))).map((e, i) => ((parseInt(a.split(",")[i]) || 0) * (parseInt(b.split(",")[i]) || 1)))
  },
  mod: {
    format: "$%$",
    args: 2,
    call: (a, b) => Array.from(Array(Math.max(a.split(",").length, b.split(",").length))).map((e, i) => ((parseInt(a.split(",")[i]) || 0) % (parseInt(b.split(",")[i]) || parseInt(a.split(",")[i]) + 1 || 0)).toFixed(0))
  },
  genBet: {
    format: "$~$",
    args: 2,
    call: (a, b) => Array.from(Array(parseInt(b) - parseInt(a) + 1)).map((e,i) => i + parseInt(a))
  },
  genFix: {
    format: "#**#",
    args: 2,
    call: (a, b) => Array.from(Array(parseInt(b))).map(e => parseInt(a))
  },
  shift: {
    format: "&|",
    args: 1,
    call: a => {let e = a.split(","); e.shift(); return e}
  },
  pop: {
    format: "&||",
    args: 1,
    call: a => {let e = a.split(","); e.pop(); return e}
  },
  spliceDel: {
    format: "&|#|#",
    args: 3,
    call: (a,b,c) => {let e = a.split(","); e.splice(parseInt(b),parseInt(c)); return e}
  },
  length: {
    format: "#_",
    args: 1,
    call: a => [a.split(",").length]
  },
  spliceAdd: {
    format: "&^#^$",
    args: 3,
    call: (a,b,c) => {let e = a.split(","); e.splice(parseInt(b),0,parseInt(c)); return e}
  },
  fuse: {
    format: "$:$",
    args: 2,
    call: (a, b) => Array.from(Array(b.split(",").length + a.split(",").length)).map((e,i) => a.split(",")[i] || b.split(",")[i-a.split(",").length])
  }  
}

let globalTemp = {};

let ddata = require(diceData);

client.on("ready", () => {

  /**
  * 
  */

  console.log(`logged in as ${client.user.tag} on ${client.guilds.cache.size} server(s).`);

  /**
  * 
  */

  client.user.setActivity(`${prefix}help | Back up!`,{ type: "LISTENING" })

  /**
  * 
  */

  let increment = 0;
  let rotation = [`${prefix}help | ${client.guilds.cache.size} server(s)`]

  client.setInterval(() => {
    increment = (increment + 1) % rotation.length
    client.user.setActivity(rotation[increment],{ type: "LISTENING" })
  }, 4000)

});

client.on("message", async message => {

  if(message.author.bot || !message.content.startsWith(prefix)) return;
  
  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();
  const rawargs = message.content.slice(prefix.length + command.length + 1)

  if(command === "ping") {
    const output = embed(message)
    const start = Date.now()
    message.channel.send("pinging...")
      .then(msg => {
        msg.channel.send(
          output
            .addField(`User ping`, `:person_shrugging: ${Date.now() - start}ms`, true)
            .addField(`API ping`,`:robot: ${client.ws.ping}ms`,true)
            .addField(`Seed`, `:seedling: ${seed}`, true)
          )
        msg.delete()
      })
      .catch(err => console.warn(err))
  }

  if(command === "die") {
    if(!owners.includes(message.member.user.id)) return error(message, "Denied.")
    process.exit()
  }

  if(command === "r" || command === "rs") {
    if(!args[0]) return

    if(args[0].toLowerCase() === "store") {
      
      if(!args[1] || !args[2] || command === "rs") return error(message, "Wrong quantity of arguments.")

      if (args[2] !== "delete" && ddata.dices[args[1]]) return error(message, "Dice name already taken.")
      if (args[2] === "delete" && !ddata.dices[args[1]]) return error(message, "Dice could not be found.")

      if(args[2] === "delete") delete ddata.dices[args[1]]
      else if (args[2].match(/^([0-9]+(,)?)*$/) || args[2].match(/`+\S+`+/)) ddata.dices[args[1]] = args[2].match(/^([0-9]+(,)?)*$/) ? args[2].split(",") : args[2].match(/`+\S+`+/) ? args[2].match(/`+\S+`+/)[0].replace(/`+/g, "") : error(message, "Syntax error: dice format must be either 0,1,2,.. or `formula`");
      else return error(message, "Syntax error: dice format must be either 0,1,2,.. or \`formula\`. ")

      write(diceData, ddata);
      message.channel.send(embed(message).setDescription(addCode("diff\n+Database update succesful")))
      return
    } 
    else if(args[0].toLowerCase() === "list") {

      if(command === "rs") return

      let em = embed(message)
      let kdices = keysArray(ddata.dices)
      for (let i = 0; i < kdices.length; i++) {
        em.addField(kdices[i], ddata.dices[kdices[i]] instanceof Array ? addCode(ddata.dices[kdices[i]].join(',')) : addCode(ddata.dices[kdices[i]]), true)         
      }
      message.channel.send(em)

    }
    else if (ddata.dices[args[0]] || ddata.dices[args[0].replace(/\d+/, "x").replace(/\d+/, "y")] || ddata.dices[args[0].replace(/\d+/, "y").replace(/\d+/, "x")]) {
      let actions = rawargs.split(/ +\, +/);
      let then = []
      let rollsText = ""

      for (let index = 0; index < actions.length; index++) {
        
        if(isNaN(actions[index])) {
          
          let tempargs = actions[index].split(/ +/)
          if (!(tempargs[0].split(/[^\d]+/gi).every(x => x < 1000000))) return error(message, "The number limit is 1.000.000 on Dice " + (index + 1))
          let tempsdice = ddata.dices[tempargs[0]] || ddata.dices[tempargs[0].replace(/\d+/, "x").replace(/\d+/, "y")] || ddata.dices[tempargs[0].replace(/\d+/, "y").replace(/\d+/, "x")]

          if(!tempsdice) return error(message, `Dice ${index+1} could not be found.`)

          let dice = express(tempsdice, tempargs[0])
          let extra = (tempargs[2] ? tempargs[2] : tempargs[1] ? tempargs[1].match(/[\/\.\*\+\-\(\)\%]+/g) ? tempargs[1] : "" : "").replace(/[^\/\.\d\*\+\-\(\)\%]+/g, "");

          try {
            eval(`1${tempargs[1] || tempargs[2] ? extra : ""}`)
          } 
          catch(err) {
            error(message, `Invalid operator on dice ${index+1}.`)
            console.warn(err);
            return
          }

          if(!(dice instanceof Array)) return error(message, `Internal: wrong dice format. (at index${index+1})`)

          let rolls = [];

          for (let d = 0; d < Number(tempargs[1] ? tempargs[1].match(/[\/\.\*\+\-\(\)\%]+/g) ? 1 : tempargs[1] : 1); d++) {
            rolls.push(dice[Math.floor (Math.random() * dice.length)])
          }

          if(command === "rs") {
            rollsText += `Results: \`${rolls.join(' ').length > 1000 ? 'too long to display' : rolls.join(' ')}\`, Operation: \`${extra.length > 0 ? extra : "---"}\` \n`
          }
          else {
            rollsText += `Dice: \`${tempargs[0]}\` Quantity: \`${tempargs[1] ? tempargs[1].match(/[\/\.\*\+\-\(\)\%]+/g) ? 1 : tempargs[1] : 1}\` Results: \`${rolls.join(' ').length > 1000 ? 'too long to display' : rolls.join(' ')}\`\nOperation: \`${extra.length > 0 ? extra : "---"}\` **Sum:** \`${Math.floor(eval(rolls.reduce((a, b) => eval(`${a} + ${b}`), 0) + extra))}\` \n`
          }
          
          then.push(eval(rolls.reduce((a, b) => eval(`${a} + ${b}`), 0) + extra).toString())

        } else {
          return error(message, `Wrong arguments on dice ${index+1}.`)
        }  
      }

      if (actions.length > 1 || command === "rs") {
        rollsText += `**Global:** \`${then.join(" ")}\` `
      }

      message.channel.send(`${rollsText}\`(@${message.member.user.tag})\``)
    }
  }

  if(command === "exp") {
    message.channel.send(addCode(express(args[0], args[1], true).join(", ")))
  }

  if(command === "help") {
    message.channel.send(embed(message).setDescription("*coming soon...*"))
  }

  if(command === "bell") {

    let length = args[1]
    let lang = args[0]

    if(!speedtexts[lang] || !speedtexts["sizes"].includes(length)) return error(message, "Invalid arguments. Please chose a valid language and/or length")

    message.reply("Speedtest procedure started, You have 5s to prepare. Type _.ding! at the beginning of your message.")
      .then(() => {
        setTimeout(async () => {
          if(!hasTemp(message.member)) {
            let start = await sendText(message,lang,length)
            insertTemp(message.member,"bell", start)
          }
        },5000)
      })
      .catch(err => console.log(err))
  }

  if(command === "ding!") {
    let dingTime = message.createdTimestamp
    if(hasTemp(message.member, "bell")) {
      message.channel.send(embed(message).setDescription(`Dong. You took ${((dingTime - globalTemp[message.member.user.id].temp0.time)/1000).toFixed(2)}s to answer!`))
      endTemp(message.member)
    } else return error(message, "you have to ask for a text using _.bell first, or end your other actions")
  }

});

async function sendText(message, lang, length) {
  let rawtext = speedtexts[lang].split(". ").map(e => `${e}.`)
  let phraseLength = 0;
  switch(length) {
    case "small":
      phraseLength = 2;
      break
    case "medium":
      phraseLength = 4;
      break
    case "big":
      phraseLength = 10;
      break
  }

  let seed = Math.floor(Math.random() * (rawtext.length - (phraseLength - 1)))
  let text = Array.from(Array(phraseLength)).map((e, i) => rawtext[seed + i] || "").join(" ")
  let msg = await message.channel.send(addCode(text))
  return {time: msg.createdTimestamp, text: text};
}

function insertTemp(member, action) {
  if (globalTemp[member.user.id]) return false

  let args = Array.from(arguments)
  args.splice(0,2)
  
  globalTemp[member.user.id] = {action: action}
  for (let i = 0; i < args.length; i++) {
    globalTemp[member.user.id][`temp${i}`] = args[i]
  }
}

function hasTemp(member, action) {
  if(Object.keys(globalTemp).includes(member.user.id) && action)
    return globalTemp[member.user.id].action === action;
  else return Object.keys(globalTemp).includes(member.user.id)
}

function endTemp(member) {
  if (!globalTemp[member.user.id]) return false
  else delete globalTemp[member.user.id]
}

function write(goto, d) {
  fs.writeFile(goto, JSON.stringify (d, null, 4), err => {
    if(err) {throw err;}
  })
}

function embed(message) {
  return new Discord.MessageEmbed()
      .setAuthor(message.member.user.tag, message.author.displayAvatarURL())
      .setThumbnail(client.user.displayAvatarURL())
      .setTimestamp()
      .setFooter("meh, what am I even doing.")
}

function error(message, desc) {
  message.channel.send(embed(message).setDescription(addCode(`diff\n-${desc}`)))
}

function addCode(str) {
  return `\`\`\`${str}\`\`\``
}

function keysArray(obj) {
  return Object.keys(obj).map(function (key) { return key; })
}

function express(expression, input, errors) {
  if (expression instanceof Array) {
    return expression
  }
  else {
    let temp = (!input.match(/\d+/g) ? expression : input.match(/\d+/g).length == 1 ? expression.replace(/x/g, `${input.match(/\d+/)[0]}`) : expression.replace(/x/g, `${input.match(/\d+/)[0]}`).replace(/y/g, `${input.match(/\d+/g)[1]}`)).replace(/`+/g, "")
    let ordering = []
    let group;
    while (temp.match(/[\(\)]/g)) {
      group = temp.match(/\([^\(\)]+\)/)[0]
      temp = temp.replace(/\([^\(\)]+\)/, translate(group.replace(/[\(\)]/g, "")))
      ordering.push(group.replace(/[\(\)]/g, ""))
    }
    return translate(temp)
  }
}

function translate(group) {
  const format = group.replace(/[0-9]+(,)([0-9]+(,)?)+/g, "&").replace(/[0-9]+/g, "#")
  const args = group.split(/[^\d,]+/)
  for (const op in syntax) {
    if(format.replace(/[#&]/g, "") === syntax[op].format.replace(/[#&$]/g, "")) {
      if((format === syntax[op].format || unmatched(format,syntax[op].format).match(/^\$+$/g)) && args.length ===  syntax[op].args) {
        return syntax[op].call(args[0],args[1]);
      }
    }
  }
}

function unmatched (a,b) {
  return Array.from(Array(Math.max(a.length, b.length))).map((e, i) => b[i] ? (a[i] || undefined) !== b[i] ? b[i] : undefined : a[i]).join("")
}

client.login(token);

// x+y ==> peut aussi s'appliquer à une suite (0,1,2 + 3 ==> 3,4,5)
// x-y ==> peut aussi s'appliquer à une suite (0,1,2 - 3 ==> 0,0,0)
// x/y ==> ARRONDIT, peut aussi s'appliquer à une suite (0,1,2 / 3 ==> 0,0,1)
// x*y ==> peut aussi s'appliquer à une suite (0,1,2 * 3 ==> 0,3,6)
// x%y ==> modulo (reste quand on fait division euclidienne 3%2 = 1)
// x~y ==> génère des nombres de x à y (1~5 ==> 1,2,3,4,5)
// x**y ==> génère y x (1**5 ==> 1,1,1,1,1)
// x| ==> supprime le premier élément de x (0,1,2| ==> 1,2)
// x|| ==> supprime le dernier élément de x (0,1,2|| ==> 0,1)
// x|y|z ==> supprime z éléments à la position y dans x (0,1,2,3|2|1 ==> 0,2,3)
// x_ ==> longueur de x (0,1,2_ = 3)
// x^y^z ==> intègre z à la position y dans x (0,1,2,3^2^8,9 ==> 0,8,9,1,2,3)
// x:y ==> lie deux suites de nombres (0,1,2 + 4,5,6 ==> 0,1,2,4,5,6)
