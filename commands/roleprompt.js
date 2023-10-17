const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, roleMention, PermissionFlagsBits } = require("discord.js");

const data = new SlashCommandBuilder()
	.setName('roleprompt')
	.setDescription('Create button to assign a role to a user')
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
	.addStringOption(option =>
		option
			.setName('message')
			.setDescription('The message regarding the role prompt')
			.setRequired(true)
			.setMaxLength(2000)
	)
	.addStringOption(option =>
		option
			.setName('label')
			.setDescription('The label of the button')
			.setRequired(true)
			.setMaxLength(20)
	)
	.addRoleOption(option =>
		option
			.setName('role')
			.setDescription('The role to add to the user')
			.setRequired(true)
	)
	.addStringOption(option =>
		option
			.setName('color')
			.setDescription('The color of the button')
			.addChoices(
				{ name: 'Blue', value: 'blue' },
				{ name: 'Gray', value: 'gray' },
				{ name: 'Green', value: 'green' },
				{ name: 'Red', value: 'red' },
			)
	);

module.exports = {
	data: data,
	customNamespace: "roleprompt",
	onCommand: async (bot, interaction) => {
		const { options } = interaction;

		let message = options.getString("message");
		let label = options.getString("label");
		let role = options.getRole("role");
		let color = options.getString("color");

		if (role.rawPosition == 0) {
			interaction.reply({
				content: "You can't assign @everyone to a role.",
				ephemeral: true
			});
			return;
		}

		if (typeof color == "string") {
			if (color === "blue") {
				color = ButtonStyle.Primary;
			} else if (color === "gray") {
				color = ButtonStyle.Secondary;
			} else if (color === "green") {
				color = ButtonStyle.Success;
			} else if (color === "red") {
				color = ButtonStyle.Danger;
			}
		} else {
			color = ButtonStyle.Primary;
		}

		var row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId(`roleprompt:${role.id}`)
					.setLabel(label)
					.setStyle(color)
			);

		interaction.reply({
			content: message,
			components: [ row ]
		});
	},
	onButton: async (bot, interaction) => {
		if (!interaction.guild.members.me.permissions.has("MANAGE_ROLES")) {
			interaction.reply({
				content: "Sorry, I don't have permission to assign roles.",
				ephemeral: true
			});
			return;
		}

		let roleId = /roleprompt:([0-9]+)/.exec(interaction.customId)[1];
		let role = interaction.member.roles.cache.find(r => r.id == roleId);

		try {
			if (role) {
				await interaction.member.roles.remove(role);

				interaction.reply({
					content: `:regional_indicator_x: Role unassigned ${roleMention(roleId)}`,
					ephemeral: true
				});
			} else {
				await interaction.member.roles.add(roleId);

				interaction.reply({
					content: `:white_check_mark: Role assigned ${roleMention(roleId)}`,
					ephemeral: true
				});
			}
		} catch (error) {
			interaction.reply({
				content: `Sorry, I wasn't able to assign the role.`,
				ephemeral: true
			});
		}
	}
};
