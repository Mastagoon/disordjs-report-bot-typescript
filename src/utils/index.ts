import { Channel, Client, Guild, GuildMember, Message, User, MessageEmbed, ColorResolvable, MessageEmbedAuthor, EmbedField } from "discord.js"
import colors from "colors"
/**
 * Fetches a DJS channel object by ID. you can use this object to edit channel permissions
 * or read its history etc...
 * @param {DJS Client} bot Discord bot object
 * @param {string} id Channel ID
 * @returns DJS channel object
 */
export const getChannelById = async (bot: Client, id: string): Promise<Channel | undefined | null> => {
    try {
        let channel: Channel | null | undefined = bot.channels.cache.get(id)
        if (channel) return channel
        channel = await bot.channels.fetch(id)
        return channel
    } catch (err: any) {
        log(`error fetching channel ${id}. ${err.message}`, "error")
    }
}

/**
 * Fetches a DJS channel object by name. if there are multiple channels with the same name, the first one is chosen 
 * and sent from the bot cache. 
 * @param {DJS Guild} guild DJS guild object
 * @param {string} channelName 
 * @returns DJS channel object
 */
export const getChannelByName = (guild: Guild, channelName: string): Channel | undefined => {
    return guild.channels.cache.find(channel => channel.name == channelName)
}

/**
 * Fetches a Discord user object by ID.
 * @param {DJS Client} bot 
 * @param {string} id userId 
 * @returns User object on success, 0 on failure
 */
export const getUserById = async (bot: Client, id: string): Promise<User | undefined> => {
    let user = bot.users.cache.get(id)
    if (user) return user
    user = await bot.users.fetch(id)
    return user
}

/**
 * Fetches a Discord user object by their username.
 * @param {DJS Guild Object} guild
 * @param {String} name username
 * @returns user object on success
 */
export const getUserByUsername = async (guild: Guild, name: string): Promise<User | undefined> => {
    const member = (await guild.members.fetch({ query: name })).first()
    return member?.user
}

/**
 * Sends a message to a user or a member
 * @param {User|Member} user DJS user or member object 
 * @param {any} message 
 * @returns a message object
 */
export const DM = async (user: User | undefined, message: any): Promise<Message | undefined> => {
    try {
        const mes = await user?.send(message)
        return mes
    } catch (err: any) {
        log(`${err.message}`, "error")
    }
}

/**
 * Fetches a discord guild object by its ID
 * @param {DJS Client} bot 
 * @param {string} id Guild ID
 * @returns DJS guild object
 */
export const getGuildById = async (bot: Client, id: string): Promise<Guild | undefined> => {
    let guild: Guild | undefined = bot.guilds.cache.get(id)
    if (guild) return guild
    guild = await bot.guilds.fetch(id)
    return guild
}

/**
 * Fetches a Discord guild object by its name
 * @param {DJS Client} bot 
 * @param {String} name Guild Name
 * @returns DJS guild object
 */
export const getGuildByName = (bot: Client, name: string): Guild | undefined => {
    let guild = bot.guilds.cache.find(guild => guild.name == name)
    return guild
}

/**
 * Fetches a discord member from a certain guild by their user ID
 * @param {DJS Guild} guild 
 * @param {String} memberId 
 * @returns DJS member object
 */
export const getMemberById = async (guild: Guild, memberId: string): Promise<GuildMember | undefined> => {
    let member = guild.members.cache.get(memberId)
    if (member) return member
    member = await guild.members.fetch(memberId)
    return member
}

/**
 * Fetches a discord member from a certain guild by their username
 * @param {DJS Guild} guild 
 * @param {String} username 
 * @returns DJS member object
 */
export const getMemberByUsername = async (guild: Guild, username: string): Promise<GuildMember | undefined> => {
    let members = await guild.members.fetch({ query: username })
    return members?.first()
}

/**
 * 
 * @param {Guild} guild 
 * @param {string} tag 
 * @returns 
 */
export const getMemberByTag = async (guild: Guild, tag: string): Promise<GuildMember | undefined> => {
    let members = await guild.members.fetch({ query: tag.split("#")[0] })   // all members with this username
    const member = members.find(m => m.user.discriminator == tag.split("#")[1])
    return member
}

/**
 * Fetches a Discord user object by their tag.
 * @param {DJS Client} bot 
 * @param {String} tag user tag
 * @returns user object on success
 */
export const getUserByTag = async (guild: Guild, tag: string): Promise<User | undefined> => {
    const member = await getMemberByTag(guild, tag)
    return member?.user
}


/**
 * This loggs everything
 * @param {String} message the log message
 * @param {String} type message type (debug, info, warning, error). messages are debug by default.
 */
export const log = (message: string, type: string): void => {
    switch (type) {
        default:
        case "debug":
            console.log(`[Debug]: `.cyan + `${message}`)
            break
        case "info":
            console.log(`[Info]: ${message}`)
            break
        case "warning":
            console.log(`[Warning]: `.yellow + `${message} `)
            break
        case "error":
            console.log(`[Error]: `.red + `${message}`)
            break
    }
}

/**
 * This function makes it easier to build a message embed object.
 * @param {String|Undefined} color color of the embed
 * @param {String|Undefined} title embed title
 * @param {Object|Undefined} author author name, iconURL, and a click URL
 * @param {Object|Undefined} fields embed fields
 * @param {URL|Undefined} thumbnail the small image at the top left corner of an embed
 * @param {Object|Undefined} footer footer icon and text
 * @param {String|Undefined} description the top most text in the embed after its title
 * @param {URL|Undefined} image a large image at the top right corner of the embed
 * @returns a message embed object
 */
export const makeEmbed = (color: ColorResolvable = "#00ff00", title?: string, author?: MessageEmbedAuthor, fields?: EmbedField[] | any, thumbnail?: string, footer?: any, description?: string, image?: string): MessageEmbed => {
    const embed = new MessageEmbed()
    embed.setColor(color)
    title && embed.setTitle(title)
    author && embed.setAuthor(author.name || "None", author.iconURL, author.url)
    fields && embed.addFields(fields)
    thumbnail && embed.setThumbnail(thumbnail)
    footer && embed.setFooter(footer)
    image && embed.setImage(image)
    description && embed.setDescription(description)
    return embed
}