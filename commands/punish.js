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
                .setDescription("경고 메시지를 받을 사용자")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // 관리자 권한만 사용 가능

    async execute(interaction) {
        const targetUser = interaction.options.getUser("사용자");
        const messageCount = 30; // 요청하신 도배 횟수

        if (
            !interaction.memberPermissions.has(
                PermissionFlagsBits.Administrator
            )
        ) {
            return interaction.reply({
                content: "❌ 이 명령어는 **서버 관리자**만 사용할 수 있습니다.",
                ephemeral: true,
            });
        }

        // 응징 시작 알림
        await interaction.deferReply({ ephemeral: true });

        const punishmentMessage = `${targetUser} **좀 그만해**`;

        // 30번 도배 메시지 전송
        for (let i = 0; i < messageCount; i++) {
            await interaction.channel.send(punishmentMessage);
            // Rate Limit 방지를 위해 짧은 지연시간 (500ms)을 줍니다.
            await new Promise((resolve) => setTimeout(resolve, 500));
        }

        // 응징 완료 알림
        await interaction.followUp({
            content: `✅ ${targetUser.tag}에 대한 응징 (${messageCount}회 도배)을 완료했습니다.`,
            ephemeral: true,
        });
    },
};
