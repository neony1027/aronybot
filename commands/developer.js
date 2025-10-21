// commands/developer.js

const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("개발자")
        .setDescription("개발자의 상태를 알려줍니다."),

    async execute(interaction) {
        // 🚨 3초 타임아웃을 피하기 위해 deferReply를 사용하여 Unknown interaction 오류를 최종 방지합니다.
        await interaction.deferReply({ ephemeral: true });

        // 대기 후 응답을 수정하여 최종 메시지를 보냅니다.
        await interaction.editReply("뒤짐");
    },
};
