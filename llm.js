const { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI('api key for gemini');

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    catagory: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
];

const cht_model = genAI.getGenerativeModel({ model: "gemini-pro" }, safetySettings);

const ichat = cht_model.startChat({
  history: [
    {
      role: "user",
      parts: [{ text: 'you are a Minecraft bot, and you are able to use a player bot entity to modify the world if the players command you.derive what the player meant, and reply by sending the commands to player bot.you will receive your own coordinate before the text by user. !follow syntax strictly! .ONLY REPLY IN COMMANDS .||#GOTO <coordinates> bot goes to coordinate||#ATTACK <entityname> bot attacks the nearest entity that is specified||#LOOKAT <entity/block> <entity.type/coordinates> <entity.name> {do not put <entity.name if looking at block >}||#DROP <item> <count>||#DROPALL to drop all items in inventory {use DROP more often}||#BREAK <coordinates>||#PLACE <item> <coordinates>||#OPEN <coordinates> to open a block like chest/door/barrel/trapdoor/gate||#FILL <item> <coordinate 1> <coordinate 2> to fill an cuboidal area #LOCATE <entity.type> <entity.name> eg. #LOCATE cow or #LOCATE player Seshrut||#FIND <block>||#CHAT <text> dont use # in text||#COLLECT <item>||#HOLD <item> <loc> to hold item(previously in inventory) in <loc> loc = hand/head/feet/torso/legs/off-hand ||#LEAVE !!ONLY DO IF USER ASKS TO!!... reply to this message with ok and use only commands to reply after that.....example input 12 78 -20 go kill the pig and bring its meat to me expected outcome #LOCATE Pig #ATTACK Pig #COLLECT raw_porkchop #LOCATE Player #LOOKAT entity player Seshrut #DROP raw_porkchop all"' }],
    },
    {
      role: "model",
      parts: [{ text: "ok" }],
    },
    {
      role: "user",
      parts: [{ text: "you usually get syntax wrong, you don't need to use GOTO before PLACE or BREAK. do not use ~ anywhere. do not capitalize entity name.second thing, you are in survival mode, so you cannot use commands. USE LOCATE FOR ENTITY AND GOTO FOR BLOCKS" }],
    },
    {
      role: "model",
      parts: [{ text: "ok" }],
    },
    {
      role: "user",
      parts: [{ text: "bot, goto 0 40 20 attack the cow there. say attacked .locate me . hold raw beef. drop raw beef " }],
    },
    {
      role: "model",
      parts: [{ text: "#GOTO 0 40 20\n#ATTACK Cow\n#CHAT attacked\n#LOCATE Player\n#HOLD raw_beef hand\n#DROP raw_beef all", }],
    },
    {
      role: "user",
      parts: [{ text: "now goto 20 60 80 and place cobblestone there. say i didnt like that cobble anyways and break it." }],
    },
    {
      role: "model",
      parts: [{ text: "#GOTO 20 60 80\n#PLACE cobblestone 20 60 80\n#CHAT i didnt like that cobble anyways\n#BREAK 20 60 80" }],
    },
    {
      role: "user",
      parts: [{ text: "find gold blocks, i lost them" }],
    },
    {
      role: "model",
      parts: [{ text: "#FIND gold_block" }],
    },
    {
      role: "user",
      parts: [{ text: "yay, you found it, break it and collect it. then come to me and drop it" }],
    },
    {
      role: "model",
      parts: [{ text: "#BREAK " }],
    },
    {
      role: "user",
      parts: [{ text: "thankyou, you found my gold" }],
    },
    {
      role: "model",
      parts: [{ text: "#CHAT You're welcome. I'm glad I could help." }],
    },
    {
      role: "user",
      parts: [{ text: "fill area from 12 34 56 to 20 38 65 with cobblestone" }],
    },
    {
      role: "model",
      parts: [{ text: "#FILL cobblestone 12 34 56 20 38 65 #CHAT filled the area with cobblestone" }],
    },
  ],
  generationConfig: {
    temperature: 0.6,
    maxOutputTokens: 1000,
  },
});

export async function talk(promt,bot) {
  const msg = promt;
  try {
    const result = await ichat.sendMessage(msg);
    const response = await result.response;
    const text = response.text();
    findcommand(text,bot)
  }
  catch (error) {
    bot.chat("google error type again")
  }
}
//------------------------------------------------------------------------------------------//
const Vec3 = require("vec3");
const { pathfinder, Movements } = require("mineflayer-pathfinder");
const { GoalNear } = require("mineflayer-pathfinder").goals; // goalfollow dynamic is not working ;-;
const pvp = require("mineflayer-pvp").plugin;
const toolplugin = require("mineflayer-tool").plugin;

bot.loadPlugin(pathfinder);
bot.loadPlugin(pvp);
bot.loadPlugin(toolplugin);

let mcData
let defaultMove
let list = []



// MAIN COMMAND HANDLER

export async function findcommand(respond,bot) {
    let token = respond.split("#");
    console.log(token);
    let command_len = token.length;
    let i = 1;
  
    while (i < command_len) {
      let command = token[i];
      let com_split = command.split(" ");
      // goto coordinates
      if (com_split[0] === "GOTO") {
        i = i + 1;
        try {
          let x = com_split[1];
          let y = com_split[2];
          let z = com_split[3];
          await walkto(x, y, z, 3);
          console.log("reached");
        } catch (error) {
          talk("cannot reach those coordinates or Syntax Error,#GOTO <coordinates>")
          break;
        }
      }
      // chat with players
      if (com_split[0] === "CHAT") {
        i = i + 1;
        try {
          let text = command.slice(4);
          bot.chat(text);
        } catch (error) {
          await talk("Syntax error, #CHAT <message>")
        }
      }
      // drop specific item
      if (com_split[0] === "DROP") {
        i = i + 1;
        try {
          const mcData = require("minecraft-data")(bot.version);
          let myitem = com_split[1];
          let mycount = bot.inventory.count(mcData.itemsByName[myitem].id);
          await bot.toss(mcData.itemsByName[myitem].id, null, mycount);
        } catch (error) {
          await talk("item name was not correct or Syntax Error,#DROP <item>")
        }
      }
      // drop all items in inventory
      if (com_split[0] === "DROPALL") {
        i = i + 1;
        try {
          var o = 0;
          while (o <= 999) {
            try {
              await bot.tossStack(bot.inventory.slots[o]);
            } catch (error) { }
            o = o + 1;
          }
        } catch (error) {
          await talk("item name was not correct or syntax error, #DROPALL");
        }
      }
      // break block at coordinate
      if (com_split[0] === "BREAK") {
        i = i + 1;
        try {
          let x = com_split[1];
          let y = com_split[2] - 1;
          let z = com_split[3];
          let vec = new Vec3(x, y, z);
          let mcData = require("minecraft-data")(bot.version);
          let defaultMove = new Movements(bot, mcData);
          bot.pathfinder.setMovements(defaultMove);
          const myGoal = new GoalNear(x, y, z, 2);
          await bot.pathfinder.goto(myGoal);
          console.log(bot.blockAt(vec).name);
          if (!bot.canDigBlock(bot.blockAt(vec))) {
            bot.chat("cannot dig it");
            return;
          }
          await bot.tool.equipForBlock(bot.blockAt(vec));
          await bot.dig(bot.blockAt(vec));
        } catch (error) {
          await talk("cannot reach those coordinates or Syntax error, #BREAK <ccordinates>");
        }
      }
      // place specific block at coordinate
      if (com_split[0] === "PLACE") {
        i = i + 1;
        try {
          let myitem = com_split[1];
  
          let x = com_split[2];
          let y = com_split[3] - 1;
          let yref = com_split[3] - 2;
          let z = com_split[4];
          let vec = new Vec3(x, y, z);
          let vecref = new Vec3(x, yref, z);
          let mcData = require("minecraft-data")(bot.version);
          let defaultMove = new Movements(bot, mcData);
          bot.pathfinder.setMovements(defaultMove);
          const myGoal = new GoalNear(x, y, z, 3);
          await bot.pathfinder.goto(myGoal);
          console.log(bot.blockAt(vec).name);
          console.log(bot.blockAt(vecref).name);
          bot.equip(mcData.itemsByName[myitem].id, "hand");
          let refblock = bot.blockAt(vecref);
          console.log(refblock.name);
          await bot.placeBlock(refblock, new Vec3(0, 1, 0));
        } catch (error) {
          await talk("cannot reach those coordinates or block unavailable or syntax error #PLACE <item> <coordinates> {remember to use lower case in item}");
        }
      }
      // locate entity or player
      if (com_split[0] === "LOCATE") {
        i = i + 1;
        toloc = com_split[1];
        try {
          if (toloc === "Player" || toloc === "player") {
            let plyername = com_split[2];
            let myEntity = bot.players[plyername].entity;
            let x = myEntity.position.x;
            let y = myEntity.position.y;
            let z = myEntity.position.z;
            const mcData = require("minecraft-data")(bot.version);
            const movements = new Movements(bot, mcData);
            movements.allow1by1towers = true;
            bot.pathfinder.setMovements(movements);
            const myGoal = new GoalNear(x, y, z, 1);
            await bot.pathfinder.goto(myGoal);
          } else {
            const myEntity = bot.nearestEntity(
              (entity) => entity.name === tolowercase(toloc),
            );
            if (!myEntity) {
              bot.chat("no entity found");
              return;
            }
            let x = myEntity.position.x;
            let y = myEntity.position.y;
            let z = myEntity.position.z;
            const mcData = require("minecraft-data")(bot.version);
            const movements = new Movements(bot, mcData);
            movements.allow1by1towers = true;
            bot.pathfinder.setMovements(movements);
            const myGoal = new GoalNear(x, y, z, 1);
            await bot.pathfinder.goto(myGoal);
          }
        } catch (error) {
          await talk("you did not use proper syntax in LOCATE or entity not found");
        }
      }
      // kill entity or player
      if (com_split[0] === "ATTACK") {
        i = i + 1;
        try {
          let myentity = com_split[1];
          let myEntity = bot.nearestEntity((entity) => entity.name === myentity);
          if (!myEntity) {
            bot.chat("no entity found");
          }
          await bot.pvp.attack(myEntity);
        } catch (error) {
          await talk("entity not found, try to locate it first or syntax error, #ATTACK <entity> {remember to use lower case in entity name}");
        }
      }
      // hold item in slot
      if (com_split[0] === "HOLD") {
        i = i + 1;
        try {
          let mcData = require("minecraft-data")(bot.version);
          let myitem = com_split[1];
          let loc = com_split[2];
          bot.equip(mcData.itemsByName[myitem].id, loc);
        } catch (error) {
          await talk("item not found in inventory, or syntax error, #HOLD <itemname> {remember t use lower case in itemname}");
        }
      }
      // find specific block in vicinity
      if (com_split[0] === "FIND") {
        i = i + 1;
        try {
          let myblockname = com_split[1];
          const mcData = require("minecraft-data")(bot.version);
          let myblockid = mcData.blocksByName[myblockname].id;
          console.log(myblockid);
          let myblockworld = bot.findBlock({ matching: myblockid, maxDistance: 128 });
          console.log(myblockworld)
          let myblockloc = myblockworld.position
          let x = myblockloc.x;
          let y = myblockloc.y;
          let z = myblockloc.z;
          const movements = new Movements(bot, mcData);
          bot.pathfinder.setMovements(movements);
          let myGoal = new GoalNear(x, y, z, 1);
          await bot.pathfinder.goto(myGoal);
        } catch (error) {
          await talk('Wrong Syntax, #FIND <blockname> {remember to use lowercase in blockname}')
        }
      }
      // fill in a cuboid [to be rewritten]
      if (com_split[0] === "FILL") {
        i = i + 1
        let myitem = com_split[1];
        let cordx1 = com_split[2];
        let cordy1 = com_split[3];
        let cordz1 = com_split[4];
        let cordx2 = com_split[5];
        let cordy2 = com_split[6];
        let cordz2 = com_split[7];
        let Ox = Math.min(cordx1, cordx2);
        let Oy = Math.min(cordy1, cordy2);
        let Oz = Math.min(cordz1, cordz2);
        let Px = Math.max(cordx1, cordx2);
        let Py = Math.max(cordy1, cordy2);
        let Pz = Math.max(cordz1, cordz2);
        let xBlocks = Math.abs(cordx1 - cordx2);
        let yBlocks = Math.abs(cordy1 - cordy2);
        let zBlocks = Math.abs(cordz1 - cordz2);
        await walkto(Ox, Oy, Oz)
        //goto Ox Oy Oz
        for (let y = 0; y <= yBlocks; y++) {
          for (let z = 0; z <= zBlocks; z++) {
            for (let x = 0; x <= xBlocks; x++) {
              // y is even z is even; walkto(Ox+x,Oy+y,Oz+z)
              if (y % 2 === 0 && z % 2 === 0) {
                let xis = Ox + x;
                let yis = Oy + y;
                let zis = Oz + z;
                // await walkto(xis - 2, yis + 1, zis - 2, 2, [bot.registry.itemsByName[myitem].id])
                await placeblock(myitem, xis, yis, zis, [bot.registry.itemsByName['cobblestone'].id])
              }
              // y is even z is odd; walkto (Ox-x, Oy+y, Oz+z)
              if (y % 2 === 0 && z % 2 === 1) {
                let xis = Px - x;
                let yis = Oy + y;
                let zis = Oz + z;
                // await walkto(xis - 2, yis + 1, zis - 2, 2, [bot.registry.itemsByName[myitem].id])
                await placeblock(myitem, xis, yis, zis, [bot.registry.itemsByName['cobblestone'].id])
              }
              // y is odd z is even; walkto (Ox+x,Oy+y,Oz-z)
              if (y % 2 === 1 && z % 2 === 0) {
                let xis = Ox + x;
                let yis = Oy + y;
                let zis = Pz - z;
                // await walkto(xis - 2, yis + 1, zis - 2, 2, [bot.registry.itemsByName[myitem].id])
                await placeblock(myitem, xis, yis, zis, [bot.registry.itemsByName['cobblestone'].id])
              }
              // y is odd z is odd; walkto (Ox-x, Oy+y, Oz-z)
              if (y % 2 === 1 && z % 2 === 1) {
                let xis = Px - x;
                let yis = Oy + y;
                let zis = Pz - z;
                // await walkto(xis - 2, yis + 1, zis - 2, 2, [bot.registry.itemsByName[myitem].id])
                await placeblock(myitem, xis, yis, zis, [bot.registry.itemsByName['cobblestone'].id])
              }
            }
          }
        }
        if (list.length > 0) {
          bot.chat('please check these coordinates, i might have made some error there')
          for (let q = 0; q <= list.length; q++) {
            try {
              bot.chat(list[q])
            }
            catch (error) {
              await talk('Wrong syntax, #FILL <item> <coordinates1> <coordinates2> {remember to put item name in lower case}')
            }
          }
        }
        list = [];
      }
      // wall around for perimeter
      if (com_split[0] === "WALL") {
        i = i + 1
        let myitem = com_split[1];
        let cordx1 = com_split[2];
        let cordy1 = com_split[3];
        let cordz1 = com_split[4];
        let cordx2 = com_split[5];
        let cordy2 = com_split[6];
        let cordz2 = com_split[7];
        let Ox = Math.min(cordx1, cordx2);
        let Oy = Math.min(cordy1, cordy2);
        let Oz = Math.min(cordz1, cordz2);
        let Px = Math.max(cordx1, cordx2);
        let Py = Math.max(cordy1, cordy2);
        let Pz = Math.max(cordz1, cordz2);
        let xBlocks = Math.abs(cordx1 - cordx2);
        let yBlocks = Math.abs(cordy1 - cordy2);
        let zBlocks = Math.abs(cordz1 - cordz2);
        await walkto(Ox, Oy, Oz)
        for (let y = 0; y <= yBlocks; y++) {
          for (let x = 0; x <= xBlocks; x++) {
            let xis = Ox + x;
            let yis = Oy + y;
            let zis = Oz;
            // await walkto(xis - 1, yis + 1, zis, 2, [bot.registry.itemsByName[myitem].id])
            await placeblock(myitem, xis, yis, zis, [bot.registry.itemsByName["cobblestone"].id])
          }
          for (let z = 0; z <= zBlocks; z++) {
            let xis = Px;
            let yis = Oy + y;
            let zis = Oz + z + 1;
            // await walkto(xis, yis + 1, zis - 1, 2, [bot.registry.itemsByName[myitem].id])
            await placeblock(myitem, xis, yis, zis, [bot.registry.itemsByName["cobblestone"].id])
          }
          for (let x = 0; x <= xBlocks; x++) {
            let xis = Px - x - 1;
            let yis = Oy + y;
            let zis = Pz;
            // await walkto(xis + 1, yis + 1, zis, 2, [bot.registry.itemsByName[myitem].id])
            await placeblock(myitem, xis, yis, zis, [bot.registry.itemsByName["cobblestone"].id])
          }
          for (let z = 0; z <= zBlocks; z++) {
            let xis = Ox;
            let yis = Oy + y;
            let zis = Pz - z - 1;
            // await walkto(xis, yis + 1, zis + 1, 2, [bot.registry.itemsByName[myitem].id])
            await placeblock(myitem, xis, yis, zis, [bot.registry.itemsByName["cobblestone"].id])
          }
        }
        if (list.length > 0) {
          bot.chat('please check these coordinates, i might have made some error there')
          for (let q = 0; q <= list.length; q++) {
            try {
              bot.chat(list[q])
            }
            catch (error) {
              await talk('Wrong syntax, #FILL <item> <coordinates1> <coordinates2> {remember to put item name in lower case}')
            }
          }
        }
        list = [];
      }
      // INCOMPLETE DEPOSITE ITEM
      /*if (com_split[0] === "DEPOSIT") {
        i = i + 1
        try {
          item = com_split[1] // change HISTORY
          x = com_split[2]
          y = com_split[3]
          z = com_split[4]
          await walkto(x, y, z)
          await bot.lookAt(new Vec3(x,y,z))
          myblock = bot.blockAt(new Vec3(x, y, z))
          myentity = bot.entityAtCursor({maxDistance:5})
          myentityname = myentity.name
          console.log(myentityname)
          if(myentityname.endsWith('minecart')){
            bot.chat(`uff, i am not able to use ${myentityname} currently`)
          }
          myblockname = myblock.name
          console.log(myblockname)
          prop = myblock.getProperties()
          console.log(prop.type)
        }
        catch (error) {
          talk('Syntax error, use #DEPOSIT <item> <coordinates>')
        }
      }*/
      // TO ADD :- WITDRAW ITEM; CRAFTING; SMELTING; TRADING
    }
  }
  
  
  
  async function walkto(x, y, z, precision = 2, scaffolding = [bot.registry.itemsByName['cobblestone'].id, bot.registry.itemsByName['dirt'].id]) {
    let mcData = require("minecraft-data")(bot.version);
    let defaultMove = new Movements(bot, mcData);
    defaultMove.scafoldingBlocks = scaffolding;
    bot.pathfinder.setMovements(defaultMove);
    const myGoal = new GoalNear(x, y, z, precision);
    await bot.pathfinder.goto(myGoal);
  }
  
  
  async function placeblock(myitem, x, y, z, scaffolding = []) {
    try {
      let botx = bot.entity.position.x
      let boty = bot.entity.position.y
      let botz = bot.entity.position.z
      console.log(botx, boty, botz)
      let refvec = Vec3(x, y - 1, z);
      defaultMove.canDig = false;
      defaultMove.scafoldingBlocks = scaffolding;
      bot.pathfinder.setMovements(defaultMove);
      let myGoal = new GoalNear(x, y, z, 3);
      await bot.pathfinder.goto(myGoal);
      bot.equip(mcData.itemsByName[myitem].id, "hand");
      let refblock = bot.blockAt(refvec);
      if ((Math.abs(botx - x) < 1 || Math.abs(botz - z) < 1) && Math.abs(boty - y) < 1) {
        defaultMove.canDig = false;
        bot.pathfinder.setMovements(defaultMove);
        let myGoal2 = new GoalNear(x - 1, y, z - 1, 1);
        await bot.pathfinder.goto(myGoal2);
        bot.equip(mcData.itemsByName[myitem].id, "hand");
      }
      if ((Math.abs(botx - x) > 3 || Math.abs(botz - z) > 3) && Math.abs(boty - y) > 2) {
        defaultMove.canDig = false;
        bot.pathfinder.setMovements(defaultMove);
        let myGoal2 = new GoalNear(x - 1, y, z - 1, 1);
        await bot.pathfinder.goto(myGoal2);
        await bot.placeBlock(refblock, new Vec3(0, 1, 0));
        bot.equip(mcData.itemsByName[myitem].id, "hand");
      }
      await bot.placeBlock(refblock, new Vec3(0, 1, 0));
    }
    catch (error) {
      let slised = error.message.slice(18, 31);
      list.push(slised)
      console.log(list.length)
    }
  }
  