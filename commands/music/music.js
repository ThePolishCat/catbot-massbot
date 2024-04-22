const {
  EmbedBuilder,
  ApplicationCommandOptionType,
} = require("discord.js");
const client = require("../../index");

module.exports = {
  name: "music",
  description: "Complete music system.",
  options: [{
    name: "play",
    description: "Play a song.",
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: "query",
      description: "Provide the name of the url for the song.",
      type: ApplicationCommandOptionType.String,
      required: true,
    }]
  },
  {
    name: "volume",
    description: "Adjust the song volume.",
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: "percent",
      description: "10 = 10%",
      type: ApplicationCommandOptionType.Number,
      min_value: 1,
      max_value: 100,
      required: true,
    }]
  },
  {
    name: "options",
    description: "Select an option.",
    type: ApplicationCommandOptionType.Subcommand,
    options: [{
      name: "options",
      description: "Select an option.",
      type: ApplicationCommandOptionType.String,
      choices: [
        { name: "queue", value: "queue" },
        { name: "skip", value: "skip" },
        { name: "pause", value: "pause" },
        { name: "resume", value: "resume" },
        { name: "stop", value: "stop" }
      ],
      required: true,
    }]
  },
  ],
  run: async (interaction, client) => {
    const { options, member, guild, channel } = interaction;

    const subcommand = options.getSubcommand();
    const query = options.getString("query");
    const volume = options.getNumber("percent");
    const option = options.getString("options");
    const voiceChannel = member.voice.channel;

    const embed = new EmbedBuilder();

    if (!voiceChannel) {
      embed.setColor("Red").setDescription("You must be in a vc");
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (!member.voice.channelId == guild.members.me.voice.channelId) {
      embed
        .setColor("Red")
        .setDescription(
          `You can't use the music system as its already active in <#${guild.members.me.voice.channelId}>`
        );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    try {
      switch (subcommand) {
        case "play":
          client.distube.play(voiceChannel, query, {
            textChannel: channel,
            member: member,
          });
          return interaction.reply({ content: "🎶 Request received." });
        case "volume":
          client.distube.setVolume(voiceChannel, volume);
          return interaction.reply({
            content: `🔊 Volume has been set to ${volume}%.`,
          });
        case "options":
          const queue = await client.distube.getQueue(voiceChannel);

          if (!queue) {
            embed.setColor("Red").setDescription("There is no active queue.");
            return interaction.reply({ embeds: [embed], ephemeral: true });
          }

          switch (option) {
            case "skip":
              await queue.skip(voiceChannel);
              embed
                .setColor("Green")
                .setDescription("⏩ The song has been skipped");
              return interaction.reply({ embeds: [embed], ephemeral: true });
            case "stop":
              await queue.stop(voiceChannel);
              embed
                .setColor("Green")
                .setDescription("🛑 The queue has been stopped");
              return interaction.reply({ embeds: [embed], ephemeral: true });
            case "pause":
              await queue.pause(voiceChannel);
              embed
                .setColor("Green")
                .setDescription("⏸️ The song(s) has been paused");
              return interaction.reply({ embeds: [embed], ephemeral: true });
            case "resume":
              await queue.resume(voiceChannel);
              embed
                .setColor("Green")
                .setDescription("▶️ The song(s) has been resumed");
              return interaction.reply({ embeds: [embed], ephemeral: true });
            case "queue":
              await queue.pause(voiceChannel);
              embed
                .setColor("Green")
                .setDescription(
                  `${queue.songs.map(
                    (song, id) =>
                      `\n**${id + 1}.** ${song.name} -\` ${song.formattedDuration
                      } \``
                  )}`
                );
              return interaction.reply({ embeds: [embed], ephemeral: true });
          }
      }
    } catch (err) {
      console.log(err);

      embed.setColor("Red").setDescription("❌ | Something went wrong...");

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
