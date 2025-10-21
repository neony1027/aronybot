const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");

const difficultyLevels = {
    b5: 1,
    b4: 2,
    b3: 3,
    b2: 4,
    b1: 5,
    s5: 6,
    s4: 7,
    s3: 8,
    s2: 9,
    s1: 10,
    g5: 11,
    g4: 12,
    g3: 13,
    g2: 14,
    g1: 15,
    p5: 16,
    p4: 17,
    p3: 18,
    p2: 19,
    p1: 20,
    d5: 21,
    d4: 22,
    d3: 23,
    d2: 24,
    d1: 25,
    r5: 26,
    r4: 27,
    r3: 28,
    r2: 29,
    r1: 30,
};

function getDifficultyName(level) {
    if (level === 0) return "Unrated";
    const tierMap = {
        30: "Ruby",
        25: "Diamond",
        20: "Platinum",
        15: "Gold",
        10: "Silver",
        5: "Bronze",
    };
    const tierValue = Math.ceil(level / 5) * 5;
    const tierName = tierMap[tierValue];
    const tierLevel = 6 - (level % 5 === 0 ? 5 : level % 5);
    return `${tierName} ${tierLevel}`;
}

function getDifficultyColor(level) {
    if (level >= 26) return 0xff0000;
    if (level >= 21) return 0x00b4fc;
    if (level >= 16) return 0x00d4aa;
    if (level >= 11) return 0xffc700;
    if (level >= 6) return 0xaaaaaa;
    if (level >= 1) return 0xff9900;
    return 0x808080;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("문제추천")
        .setDescription("Solved.ac에서 난이도별 랜덤 문제를 추천합니다.")
        .addStringOption((option) =>
            option
                .setName("난이도")
                .setDescription("예: s3, g1, p5 (브론즈5 ~ 루비1)")
                .setRequired(true)
                .setAutocomplete(true)
        ),

    async execute(interaction) {
        const difficultyInput = interaction.options
            .getString("난이도")
            .toLowerCase();
        const level = difficultyLevels[difficultyInput];

        await interaction.deferReply();

        if (!level) {
            return interaction.editReply(
                "❌ 올바른 난이도(예: s3, g1, p5)를 입력해주세요."
            );
        }

        try {
            const apiUrl = `https://solved.ac/api/v3/search/problem?query=solvable:true+level:${level}&sort=random&page=1`;
            const response = await axios.get(apiUrl);
            const allProblems = response.data.items;

            // ✅ JS단에서 level 일치하는 문제만 추출
            const filtered = allProblems.filter((p) => p.level === level);

            if (filtered.length === 0) {
                return interaction.editReply(
                    `해당 난이도(${difficultyInput.toUpperCase()})의 문제를 찾을 수 없습니다.`
                );
            }

            const problem =
                filtered[Math.floor(Math.random() * filtered.length)];
            const title = problem.titleKo || `[문제 ${problem.problemId}]`;
            const color = getDifficultyColor(problem.level);
            const levelName = getDifficultyName(problem.level);
            const tags =
                problem.tags
                    ?.map(
                        (t) =>
                            `#${
                                t.displayNames.find((d) => d.language === "ko")
                                    ?.name || t.displayNames[0].name
                            }`
                    )
                    .join(" ") || "없음";

            const embed = new EmbedBuilder()
                .setColor(color)
                .setTitle(`📘 [${problem.problemId}] ${title}`)
                .setURL(`https://www.acmicpc.net/problem/${problem.problemId}`)
                .setDescription(`**추천 난이도:** ${levelName}`)
                .addFields(
                    {
                        name: "문제 번호",
                        value: `${problem.problemId}`,
                        inline: true,
                    },
                    {
                        name: "평균 시도 횟수",
                        value: `${problem.averageTries?.toFixed(2) || "N/A"}`,
                        inline: true,
                    },
                    { name: "태그", value: tags }
                )
                .setFooter({ text: "Powered by solved.ac API" })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (err) {
            console.error("Solved.ac API 오류:", err.message);
            await interaction.editReply(
                "💥 Solved.ac API 요청 중 오류가 발생했습니다."
            );
        }
    },

    async autocomplete(interaction) {
        const focused = interaction.options.getFocused().toLowerCase();
        const choices = [
            "b5",
            "b4",
            "b3",
            "b2",
            "b1",
            "s5",
            "s4",
            "s3",
            "s2",
            "s1",
            "g5",
            "g4",
            "g3",
            "g2",
            "g1",
            "p5",
            "p4",
            "p3",
            "p2",
            "p1",
            "d5",
            "d4",
            "d3",
            "d2",
            "d1",
            "r5",
            "r4",
            "r3",
            "r2",
            "r1",
        ];
        const filtered = choices
            .filter((c) => c.startsWith(focused))
            .slice(0, 25);
        await interaction.respond(filtered.map((c) => ({ name: c, value: c }))); // ✅ 소문자 표시
    },
};
