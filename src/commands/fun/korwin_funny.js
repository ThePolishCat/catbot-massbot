import { SlashCommandBuilder } from "discord.js";
import korwin from "../../json/korwin_funny.json" assert { type: "json" };

export default {
  data: new SlashCommandBuilder()
    .setName("korwin")
    .setDescription("Korwin quote generator")
    .setIntegrationTypes([0, 1])
    .setContexts([0, 1, 2]),
  run: async (interaction) => {
    const getRandomElement = (arr) =>
      arr[Math.floor(Math.random() * arr.length)];

    const parts = ["1", "2", "3", "4", "5", "6"].map((key) =>
      getRandomElement(korwin[key])
    );

    const quote = parts.join(" ");

    await interaction.reply(quote);
  },
};
