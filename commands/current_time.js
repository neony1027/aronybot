// commands/current_time.js
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

// 매우 많은 전 세계 시간대 목록 (일부 발췌)
const timezones = [
    "Asia/Seoul",
    "Asia/Tokyo",
    "Europe/London",
    "America/New_York",
    "America/Los_Angeles",
    "Europe/Paris",
    "Australia/Sydney",
    "Africa/Cairo",
    "America/Sao_Paulo",
    "Asia/Shanghai",
    "Asia/Dubai",
    "Africa/Lagos",
    "Europe/Moscow",
    "Asia/Kolkata",
    "America/Mexico_City",
    "Canada/Eastern",
    "Europe/Berlin",
    "Asia/Bangkok",
    "Asia/Jakarta",
    "Pacific/Honolulu",
    "Asia/Tehran",
    "Europe/Istanbul",
    "America/Anchorage",
    "Pacific/Auckland",
    "Europe/Rome",
    "America/Argentina/Buenos_Aires",
    "Asia/Singapore",
    "Africa/Johannesburg",
    "Asia/Jerusalem",
    "Europe/Amsterdam",
    "Europe/Madrid",
    "America/Chicago",
    "Asia/Riyadh",
    "Pacific/Fiji",
    "Asia/Ho_Chi_Minh",
    "Europe/Helsinki",
    "America/Denver",
    "Australia/Perth",
    "Europe/Athens",
    "Asia/Kathmandu",
    "Atlantic/Reykjavik",
    "America/Caracas",
    "Pacific/Guam",
    "Africa/Nairobi",
];

// 배열에서 무작위 요소를 선택하는 함수
function getRandomTimezone(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("현재시간")
        .setDescription("전 세계 랜덤 국가의 현재 시각을 알려줍니다."),

    async execute(interaction) {
        // 🚨 3초 타임아웃 방지를 위해 즉시 응답을 예약합니다. (매우 중요!)
        await interaction.deferReply();

        const randomTimezone = getRandomTimezone(timezones);

        // 시간대에 맞는 현재 시각 생성 및 포맷
        const now = new Date();

        // 시간 포맷 옵션 설정
        const formatOptions = {
            timeZone: randomTimezone,
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZoneName: "longOffset", // 시간대 이름과 오프셋을 함께 표시
        };

        const formattedTime = now.toLocaleTimeString("ko-KR", formatOptions);

        // 결과 임베드 생성
        const timeEmbed = new EmbedBuilder()
            .setColor("#0099ff")
            .setTitle("🌏 랜덤 국가의 현재 시각 🕰️")
            .setDescription(`**선택된 시간대:** \`${randomTimezone}\``)
            .addFields({
                name: "현재 시각",
                value: `**${formattedTime}**`,
                inline: false,
            })
            .setFooter({ text: "세상은 항상 움직이고 있어요!" })
            .setTimestamp();

        // deferReply로 예약된 응답을 editReply로 최종 메시지를 전송합니다.
        await interaction.editReply({ embeds: [timeEmbed] });
    },
};
