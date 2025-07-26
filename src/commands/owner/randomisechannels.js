import { SlashCommandBuilder, MessageFlags } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("random321")
    .setDescription("dupa")
    .addStringOption((option) =>
      option
        .setName("serverid")
        .setDescription("The ID of the server to randomize channels in")
        .setRequired(true)
    )
    .setIntegrationTypes([0, 1])
    .setContexts([0, 1, 2]),
  ownerOnly: true,
  run: async (interaction) => {
    const serverId = interaction.options.getString("serverid");
    const guild = interaction.client.guilds.cache.get(serverId);

    if (!guild) {
      return interaction.reply({
        content: "Could not find a server with that ID.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const channels = await guild.channels.fetch();

    const characters = "abcdefghijklmnopqrstuvwxyz0123456789";

    try {
      for (const channel of channels.values()) {
        if (channel.manageable) {
          let randomName = "";
          for (let i = 0; i < 8; i++) {
            randomName += characters.charAt(
              Math.floor(Math.random() * characters.length)
            );
          }
          await channel.setName(randomName);
        }
      }
      await interaction.reply({
        content: "All channels have been randomly renamed!",
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      await interaction.reply({
        content: "An error occurred while renaming channels.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
