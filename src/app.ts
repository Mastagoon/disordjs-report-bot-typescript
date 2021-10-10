import { Message } from "discord.js"
import fs from "fs"
const Discord = require("discord.js")
import config from "./config/bot.conf"
require("dotenv").config()
const bot = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"], partials: ["CHANNEL", "REACTION", "MESSAGE"] })

bot.commands = new Discord.Collection()

const commandFiles = fs
    .readdirSync("./commands")
    .filter((f: String) => f.endsWith(".js"))

for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    bot.commands.set(command.name, command)
}

bot.on("ready", () => {
    console.log(`Logged in as ${bot.user.tag}`)
})

bot.on("messageCreate", (message: Message) => {
    if (!message.content.startsWith(config.prefix) || message.author.bot) return
    const args: String[] | undefined = message.content.slice(config.prefix.length).split(/ +/)
    const command = bot.commands.get(args.shift()?.toLowerCase())
    if (command)
        try {
            command.execute(message, args, bot)
        } catch (err: any) {
            console.log(err.message)
        }
})

bot.login(process.env.BOT_TOKEN)