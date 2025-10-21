// commands/punish.js

const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("응징")
        .setDescription(
            "사용자에게 경고 메시지를 반복해서 보냅니다. (관리자 전용)"
        )
        .addUserOption((option) =>
            option
                .setName("사용자")
                .setDescription("응징할 사용자")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // 관리자 권한 필요

    async execute(interaction) {
        const targetUser = interaction.options.getUser("사용자");
        const messageCount = 30; // 도배 횟수

        // 🚨 3초 타임아웃 방지를 위해 즉시 응답 예약 (필수)
        await interaction.deferReply({ ephemeral: true });

        if (
            !interaction.memberPermissions.has(
                PermissionFlagsBits.Administrator
            )
        ) {
            return interaction.editReply(
                "❌ 이 명령어는 **서버 관리자**만 사용할 수 있습니다."
            );
        }

        const punishmentMessage = `${targetUser} **좀 그만해**`;

        try {
            // 응징 메시지 반복 전송 (15초 이상 소요됨)
            for (let i = 0; i < messageCount; i++) {
                await interaction.channel.send(punishmentMessage);
                await new Promise((resolve) => setTimeout(resolve, 500)); // 0.5초 대기
            }

            // 응징 완료 알림
            await interaction.followUp({
                content: `✅ ${targetUser.tag}에 대한 응징 (${messageCount}회 도배)을 완료했습니다.`,
                ephemeral: true,
            });
        } catch (error) {
            console.error(error);
            await interaction.editReply(
                "❌ 응징 중 오류가 발생했습니다. (봇의 권한 또는 서버 문제일 수 있습니다.)"
            );
        }
    },
};
