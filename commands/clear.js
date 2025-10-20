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
                .setDescription("삭제할 메시지 개수를 입력하세요 (1~100)")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), // 메시지 관리 권한 필요

    async execute(interaction) {
        const amount = interaction.options.getInteger("개수");

        if (
            !interaction.memberPermissions.has(
                PermissionFlagsBits.ManageMessages
            )
        ) {
            return interaction.reply({
                content:
                    '❌ 이 명령어를 사용하려면 **"메시지 관리"** 권한이 필요합니다.',
                ephemeral: true,
            });
        }

        if (amount < 1 || amount > 100) {
            return interaction.reply({
                content: "메시지 개수는 1개부터 100개 사이여야 합니다.",
                ephemeral: true,
            });
        }

        try {
            // bulkDelete는 14일이 지난 메시지는 삭제할 수 없습니다.
            await interaction.channel.bulkDelete(amount, true);

            await interaction.reply({
                content: `✅ **${amount}개**의 메시지를 성공적으로 삭제했습니다.`,
                ephemeral: true,
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content:
                    "메시지를 삭제하는 동안 오류가 발생했습니다. (봇의 권한 또는 메시지 기간 확인)",
                ephemeral: true,
            });
        }
    },
};
