import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("removechannels")
    .setDescription("Removes all channels in the server")
    .setIntegrationTypes([0, 1])
    .setContexts([0, 1, 2]),
  ownerOnly: true,
  run: async (interaction, client) => {
    await interaction.deferReply({ ephemeral: true });

    try {
      const guild = interaction.guild;
      const channels = guild.channels.cache;

      await interaction.editReply({
        content: "Starting to delete all channels...",
        ephemeral: true,
      });

      for (const channel of channels.values()) {
        try {
          await channel.delete();
        } catch (err) {
          console.error(`Failed to delete channel ${channel.name}: ${err}`);
        }
      }
    } catch (error) {
      console.error(error);
    }
  },
};
