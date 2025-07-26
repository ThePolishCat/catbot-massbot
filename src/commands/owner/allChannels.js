import { SlashCommandBuilder, ChannelType } from "discord.js";
import fs from "fs";

export default {
  data: new SlashCommandBuilder()
    .setName("allchannels")
    .setDescription("Save or restore all channels and categories")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("save")
        .setDescription("Save all channels and categories to JSON")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("restore")
        .setDescription("Restore all channels and categories from JSON")
    )
    .setIntegrationTypes([0, 1])
    .setContexts([0, 1, 2]),
  ownerOnly: true,
  run: async (interaction, client) => {
    await interaction.deferReply();

    if (interaction.options.getSubcommand() === "save") {
      const channelsData = [];

      client.guilds.cache.forEach((guild) => {
        const guildChannels = {
          guildId: guild.id,
          guildName: guild.name,
          categories: [],
          channels: [],
        };

        // Get categories first
        guild.channels.cache
          .filter((channel) => channel.type === 4)
          .forEach((category) => {
            guildChannels.categories.push({
              id: category.id,
              name: category.name,
              position: category.position,
            });
          });

        // Get channels
        guild.channels.cache
          .filter((channel) => channel.type !== 4)
          .forEach((channel) => {
            guildChannels.channels.push({
              id: channel.id,
              name: channel.name,
              type: channel.type,
              parentId: channel.parentId,
              position: channel.position,
            });
          });

        channelsData.push(guildChannels);
      });

      // Save to JSON file and send to Discord
      const jsonData = JSON.stringify(channelsData, null, 2);
      fs.writeFileSync("channels.json", jsonData);

      await interaction.editReply({
        content: "Channels data has been saved",
        files: [
          {
            attachment: Buffer.from(jsonData),
            name: "channels.json",
          },
        ],
        ephemeral: true,
      });
    } else if (interaction.options.getSubcommand() === "restore") {
      try {
        const jsonData = fs.readFileSync("channels.json", "utf8");
        const channelsData = JSON.parse(jsonData);

        for (const guildData of channelsData) {
          const guild = client.guilds.cache.get(guildData.guildId);
          if (!guild) continue;

          // Delete all existing channels and categories
          await Promise.all(
            guild.channels.cache.map((channel) => channel.delete())
          );

          // Create categories first
          const categoryMap = new Map();
          for (const categoryData of guildData.categories) {
            const category = await guild.channels.create({
              name: categoryData.name,
              type: ChannelType.GuildCategory,
              position: categoryData.position,
            });
            categoryMap.set(categoryData.id, category.id);
          }

          // Create channels
          for (const channelData of guildData.channels) {
            await guild.channels.create({
              name: channelData.name,
              type: channelData.type,
              parent: channelData.parentId
                ? categoryMap.get(channelData.parentId)
                : null,
              position: channelData.position,
            });
          }
        }

        await interaction.editReply({
          content: "Channels have been restored from the JSON file",
          ephemeral: true,
        });
      } catch (error) {
        await interaction.editReply({
          content: `Error restoring channels: ${error.message}`,
          ephemeral: true,
        });
      }
    }
  },
};
