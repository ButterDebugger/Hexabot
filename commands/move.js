const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, channelMention, userMention } = require("discord.js");

const data = new SlashCommandBuilder()
	.setName('move')
	.setDescription('Manage users in a voice channel')
	.setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
	.addSubcommand(subcommand =>
		subcommand
			.setName('me')
			.setDescription('Move yourself to a voice channel')
			.addChannelOption(option =>
				option
					.setName('channel')
					.setDescription('The voice channel to move to')
					.addChannelTypes(ChannelType.GuildVoice)
					.setRequired(true)
			)
	)
	.addSubcommand(subcommand =>
		subcommand
			.setName('all')
			.setDescription('Move all users in a voice channel')
			.addChannelOption(option =>
				option
					.setName('channel')
					.setDescription('The voice channel to move to')
					.addChannelTypes(ChannelType.GuildVoice)
					.setRequired(true)
			)
	)
	.addSubcommand(subcommand =>
		subcommand
			.setName('pull')
			.setDescription('Move all users in one voice channel to another')
			.addChannelOption(option =>
				option
					.setName('channel_from')
					.setDescription('The voice channel to move from')
					.addChannelTypes(ChannelType.GuildVoice)
					.setRequired(true)
			)
			.addChannelOption(option =>
				option
					.setName('channel_to')
					.setDescription('The voice channel to move to')
					.addChannelTypes(ChannelType.GuildVoice)
					.setRequired(true)
			)
	)
	.addSubcommand(subcommand =>
		subcommand
			.setName('drag')
			.setDescription('Move a user to another voice channel')
			.addUserOption(option =>
				option
					.setName('user')
					.setDescription('The user to move')
					.setRequired(true)
			)
			.addChannelOption(option =>
				option
					.setName('channel')
					.setDescription('The voice channel to move to')
					.addChannelTypes(ChannelType.GuildVoice)
					.setRequired(true)
			)
	);

module.exports = {
	data: data,
	onCommand: async (bot, interaction) => {
		const { options, member } = interaction;

		if (!interaction.guild.members.me.permissions.has("MOVE_MEMBERS")) {
			interaction.reply({
				content: "Sorry, I don't have permission to move members.",
				ephemeral: true
			});
			return;
		}

		if (options.getSubcommand() === "me") {
			let channel = options.getChannel("channel");

			if (!member.voice.channel) {
				interaction.reply({
					content: "You have to be in a voice channel.",
					ephemeral: true
				});
				return;
			}

			try {
				member.voice.setChannel(channel);
			} catch (error) {
				interaction.reply({
					content: `Sorry, I wasn't able to move you into ${channelMention(channel.id)}.`,
					ephemeral: true
				});
				return;
			}
			
			interaction.reply({
				content: `You have been moved into ${channelMention(channel.id)}`,
				ephemeral: true
			});
		} else if (options.getSubcommand() === "all") {
			let channel = options.getChannel("channel");

			let members = await interaction.guild.members.fetch();
			let voiceMembers = members.filter(m => m.voice.channel && !(m.voice.channel.id === channel.id));

			voiceMembers.forEach(async m => {
				try {
					m.voice.setChannel(channel);
				} catch (error) { }
			});
			
			interaction.reply({
				content: `Moved ${voiceMembers.size} ${voiceMembers.size == 1 ? "user" : "users"} into ${channelMention(channel.id)}`,
				ephemeral: true
			});
		} else if (options.getSubcommand() === "pull") {
			let channelFrom = options.getChannel("channel_from");
			let channelTo = options.getChannel("channel_to");

			let members = await interaction.guild.members.fetch();
			let voiceMembers = members.filter(m => m.voice.channel && m.voice.channel.id === channelFrom.id);

			voiceMembers.forEach(async m => {
				try {
					m.voice.setChannel(channelTo);
				} catch (error) { }
			});
			
			interaction.reply({
				content: `Moved ${voiceMembers.size} ${voiceMembers.size == 1 ? "user" : "users"} from ${channelMention(channelFrom.id)} into ${channelMention(channelTo.id)}`,
				ephemeral: true
			});
		} else if (options.getSubcommand() === "drag") {
			let user = options.getUser("user");
			let channel = options.getChannel("channel");

			var userMember = interaction.guild.members.cache.get(user.id);

			if (!userMember) {
				interaction.reply({
					content: "Sorry, I couldn't find that user.",
					ephemeral: true
				});
				return;
			}

			if (!userMember.voice.channel) {
				interaction.reply({
					content: `${userMention(user.id)} is not in a voice channel.`,
					ephemeral: true
				});
				return;
			}

			try {
				userMember.voice.setChannel(channel);
			} catch (error) {
				interaction.reply({
					content: `Sorry, I wasn't able to move ${userMention(user.id)} into ${channelMention(channel.id)}.`,
					ephemeral: true
				});
				return;
			}
			
			interaction.reply({
				content: `${userMention(user.id)} has been moved into ${channelMention(channel.id)}`,
				ephemeral: true
			});
		}
	}
};
