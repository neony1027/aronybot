// commands/developer.js
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("개발자")
        .setDescription("개발자의 상태를 알려줍니다."),

    async execute(interaction) {
        // 뒤짐 메시지를 사용자에게 응답
        await interaction.reply("뒤짐");
    },
};
