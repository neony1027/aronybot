// commands/timeout.js
const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
} = require("discord.js");

// 시간 문자열 파싱 (예: "1w", "3d", "10h", "30m", "15s") -> 밀리초로 변환
function parseDuration(durationString) {
    const unit = durationString.slice(-1).toLowerCase();
    const value = parseInt(durationString.slice(0, -1));

    if (isNaN(value) || value <= 0) return null;

    switch (unit) {
        case "s":
            return value * 1000;
        case "m":
            return value * 60 * 1000;
        case "h":
            return value * 60 * 60 * 1000;
        case "d":
            return value * 24 * 60 * 60 * 1000;
        case "w":
            return value * 7 * 24 * 60 * 60 * 1000;
        default:
            return null;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("나가")
        .setDescription(
            "사용자를 지정된 기간 동안 타임아웃(채팅 금지) 시킵니다."
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
                .setDescription("기간 (예: 1w, 3d, 10h, 30m, 15s)")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("사유")
                .setDescription("타임아웃 사유")
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers), // 멤버 추방 권한 필요

    async execute(interaction) {
        const targetUser = interaction.options.getUser("사용자");
        const durationString = interaction.options.getString("기간");
        const reason = interaction.options.getString("사유") || "사유 없음";
        const durationMs = parseDuration(durationString);

        const targetMember = await interaction.guild.members.fetch(
            targetUser.id
        );

        if (
            !interaction.memberPermissions.has(
                PermissionFlagsBits.ModerateMembers
            )
        ) {
            return interaction.reply({
                content:
                    '❌ 이 명령어를 사용하려면 **"멤버 추방"** 권한이 필요합니다.',
                ephemeral: true,
            });
        }

        if (!durationMs || durationMs > 2419200000) {
            // 28일 (디스코드 최대 타임아웃 기간)
            return interaction.reply({
                content:
                    "❌ 유효한 타임아웃 기간을 입력해야 합니다. (최대 28일, 단위: s, m, h, d, w)",
                ephemeral: true,
            });
        }

        if (targetMember.moderatable === false) {
            return interaction.reply({
                content:
                    "❌ 봇보다 높은 역할을 가진 사용자이거나 서버장이므로 타임아웃 시킬 수 없습니다.",
                ephemeral: true,
            });
        }

        try {
            await targetMember.timeout(durationMs, reason);

            const embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle("🔇 타임아웃 처리 완료")
                .addFields(
                    {
                        name: "대상 사용자",
                        value: targetUser.tag,
                        inline: true,
                    },
                    { name: "기간", value: durationString, inline: true },
                    { name: "사유", value: reason, inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("타임아웃 중 오류:", error);
            await interaction.reply({
                content: `타임아웃 처리 중 오류가 발생했습니다: ${error.message}`,
                ephemeral: true,
            });
        }
    },
};
