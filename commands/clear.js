// commands/clear.js

const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("청소")
        .setDescription(
            "채널의 메시지를 지정된 개수만큼 삭제합니다. (최대 100개)"
        )
        .addIntegerOption((option) =>
            option
                .setName("개수")
                .setDescription("삭제할 메시지 개수 (1~100)")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), // 메시지 관리 권한 필요

    async execute(interaction) {
        const amount = interaction.options.getInteger("개수");

        // 🚨 3초 타임아웃 방지를 위해 즉시 응답 예약 (필수)
        await interaction.deferReply({ ephemeral: true });

        try {
            // 메시지 삭제 (amount + 1은 명령어 메시지 포함)
            const messages = await interaction.channel.messages.fetch({
                limit: amount,
            });

            // 삭제 가능한 메시지만 필터링하여 일괄 삭제
            const deletableMessages = messages.filter((m) => m.deletable);
            await interaction.channel.bulkDelete(deletableMessages, true);

            // 성공 응답 (editReply 사용)
            await interaction.editReply(
                `✅ **${deletableMessages.size}개**의 메시지를 청소했습니다.`
            );
        } catch (error) {
            console.error(error);
            await interaction.editReply(
                "❌ 메시지를 삭제하는 중 오류가 발생했습니다. (메시지가 14일이 넘었거나 봇의 권한이 부족합니다.)"
            );
        }
    },
};
