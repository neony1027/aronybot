// commands/developer.js (확인 및 저장)
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("개발자")
        .setDescription("개발자의 상태를 알려줍니다."),

    async execute(interaction) {
        // 🚨 이 코드가 반드시 있어야 합니다.
        await interaction.deferReply({ ephemeral: true });

        await interaction.editReply("뒤짐");
    },
};
