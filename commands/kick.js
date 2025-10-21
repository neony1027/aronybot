// commands/kick.js

const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("나가")
        .setDescription(
            "사용자를 지정된 기간 동안 타임아웃 시킵니다 (채팅/읽기 금지)."
        )
        .addUserOption((option) =>
            option
                .setName("사용자")
                .setDescription("타임아웃 시킬 사용자")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("기간")
                .setDescription("타임아웃 기간 (예: 1m, 1h, 1d)")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers), // 타임아웃 권한 필요

    async execute(interaction) {
        const member = interaction.options.getMember("사용자");
        const durationString = interaction.options.getString("기간");

        // 🚨 3초 타임아웃 방지를 위해 즉시 응답 예약 (필수)
        await interaction.deferReply({ ephemeral: true });

        if (!member) {
            return interaction.editReply("해당 사용자를 찾을 수 없습니다.");
        }

        // 봇 권한 확인
        if (
            !interaction.guild.members.me.permissions.has(
                PermissionFlagsBits.ModerateMembers
            )
        ) {
            return interaction.editReply(
                "❌ 봇에게 **멤버 타임아웃 권한**이 없습니다."
            );
        }

        // 기간 파싱 (d: 일, h: 시간, m: 분)
        const durationRegex = /(\d+)([dhms])/;
        const match = durationString.match(durationRegex);

        if (!match) {
            return interaction.editReply(
                "❌ 기간 형식이 올바르지 않습니다. (예: 1m, 1h, 1d)"
            );
        }

        const amount = parseInt(match[1], 10);
        const unit = match[2];
        let ms;

        switch (unit) {
            case "s":
                ms = amount * 1000;
                break;
            case "m":
                ms = amount * 60 * 1000;
                break;
            case "h":
                ms = amount * 60 * 60 * 1000;
                break;
            case "d":
                ms = amount * 24 * 60 * 60 * 1000;
                break;
            default:
                return interaction.editReply("❌ 알 수 없는 기간 단위입니다.");
        }

        try {
            // 타임아웃 적용
            await member.timeout(ms, "관리자 명령어로 인한 타임아웃");

            // 타임아웃 만료 시간 계산
            const expirationTime = new Date(Date.now() + ms);
            const timestamp = `<t:${Math.floor(
                expirationTime.getTime() / 1000
            )}:R>`;

            // 성공 응답
            await interaction.editReply(
                `✅ ${member.user.tag}님을 **${durationString}** 동안 타임아웃 시켰습니다. (만료: ${timestamp})`
            );
        } catch (error) {
            console.error(error);
            await interaction.editReply(
                "❌ 타임아웃을 적용하는 중 오류가 발생했습니다. (봇의 역할이 대상 사용자보다 상위에 있는지 확인해주세요.)"
            );
        }
    },
};
