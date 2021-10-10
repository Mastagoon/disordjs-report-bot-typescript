import { Client, Message, MessageCollector, MessageSelectMenu, MessageSelectOptionData, MessageActionRow } from "discord.js"
import { DM, getChannelByName, getUserById, makeEmbed } from "../utils"
import db from "../models"
import config from "../config/bot.conf"

//constants
let ticketType: string = ""
let counter = 0
const questions = [
    "Please provide a title for your ticket",
    "Enter your complaint in one message. Remember to be as specific as possible.",
    "Provide any external links (optional)",
    "Your ticket has been sent successfully!"
]
const option1: MessageSelectOptionData = {
    label: "Billing Issues",
    value: "billing",
    emoji: "💰"
}
const option2: MessageSelectOptionData = {
    label: "Technical Support",
    value: "technical",
    emoji: "🖥️"
}
const option3: MessageSelectOptionData = {
    label: "Account Support",
    value: "account",
    emoji: "🔒"
}
const option4: MessageSelectOptionData = {
    label: "Report a playel",
    value: "report",
    emoji: "😠"
}
const option5: MessageSelectOptionData = {
    label: "Cancel",
    value: "cancel",
    emoji: "❌"
}

module.exports = {
    name: "report",
    description: "Shows a list of all available commands.",
    usage: "report",
    aliases: "h",
    async execute(message: Message, args: String[], bot: Client): Promise<any> {
        if (!message.guild || !bot.isReady()) return
        const channelName: string = message.author.tag
        const doesChannelExist = getChannelByName(message.guild, `r-${channelName.replace("#", "").toLowerCase()}`)
        const menu = new MessageSelectMenu().setPlaceholder("Choose Ticket Type").addOptions([option1, option2, option3, option4, option5]).setCustomId("selectmenu")
        if (doesChannelExist && !doesChannelExist.deleted)
            return message.reply(`The r-${channelName.replace("#", "").toLowerCase()} channel already exists in this guild.`)
        // create channel
        const channel = await message.guild.channels.create(`r-${channelName}`, {
            permissionOverwrites: [
                {
                    id: bot.user.id,
                    deny: 'VIEW_CHANNEL'
                },
                {
                    id: message.author.id,
                    allow: 'VIEW_CHANNEL'
                },
                {
                    id: message.guild.roles.everyone.id,
                    deny: 'VIEW_CHANNEL'
                }
            ]
        })
        message.reply(`Please proceed at <#${channel.id}>`)
        channel.send(`<@${message.author.id}>`)
        const row = new MessageActionRow().addComponents(menu)
        const mes = await channel.send({ content: "Choose your complaint type", components: [row] })
        const collector = mes.createMessageComponentCollector({
            filter: (i) => i.user.id === message.author.id,
            max: 1,
            componentType: "SELECT_MENU",
            time: 180 * 1000
        })
        collector.on("end", (collected) => {
            mes?.delete()
            if (!collected.size) { // nothing chosen
                channel?.delete()
            }
        })
        collector.on("collect", (i) => {
            // collected type
            ticketType = i.values[0]
            // proceed to ask questions
            channel.send(questions[counter++])
            const messageCollector = new MessageCollector(channel, {
                max: 3,
                time: 180 * 1000,
                filter: m => m.author.id === message.author.id
            })
            messageCollector.on("end", async (collected) => {
                if (collected.size < 3) { // did not collect everything
                    channel.send("Ticket failed!")
                } else {
                    const arr = Array.from(collected.values())
                    const newTicket = await db.tickets.create({
                        discord_id: message.author.id,
                        discord_name: message.author.tag,
                        type: ticketType,
                        subject: arr[0].content,
                        description: arr[1].content,
                        links: arr[2].content,
                    })
                    const embed2 = makeEmbed(
                        '#EBCBD0',
                        `Report From ${message.author.tag} || id: ${newTicket.id}`,
                        undefined,
                        [{ name: questions[0], value: ticketType }, { name: questions[1], value: arr[0].content }, { name: questions[2], value: arr[1].content }, { name: questions[3], value: arr[2].content }],
                        message.author.displayAvatarURL(),
                        message.author.id,
                    )
                    config.admins.forEach(async (admin) => {
                        const u = await getUserById(bot, admin)
                        u?.send({ content: `User ${message.author.username} Has issued a new ticket:`, embeds: [embed2] })
                    }
                    )
                }
                setTimeout(() => channel?.delete(), 15000)
            })
            messageCollector.on("collect", () => {
                channel.send(questions[counter++])
            })
        })
    }
}