// commands/solve_problem.js

const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");

// 티어-레벨 매핑
const difficultyMap = {
    // Bronze
    b5: 1,
    b4: 2,
    b3: 3,
    b2: 4,
    b1: 5,
    // Silver
    s5: 6,
    s4: 7,
    s3: 8,
    s2: 9,
    s1: 10,
    // Gold
    g5: 11,
    g4: 12,
    g3: 13,
    g2: 14,
    g1: 15,
    // Platinum
    p5: 16,
    p4: 17,
    p3: 18,
    p2: 19,
    p1: 20,
    // Diamond
    d5: 21,
    d4: 22,
    d3: 23,
    d2: 24,
    d1: 25,
    // Ruby
    r5: 26,
    r4: 27,
    r3: 28,
    r2: 29,
    r1: 30,
};

// 난이도 이름 변환
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

// 난이도 색상
function getDifficultyColor(level) {
    if (level >= 26) return 0xff0000; // Ruby
    if (level >= 21) return 0x00b4fc; // Diamond
    if (level >= 16) return 0x00d4aa; // Platinum
    if (level >= 11) return 0xffc700; // Gold
    if (level >= 6) return 0xaaaaaa; // Silver
    if (level >= 1) return 0xff9900; // Bronze
    return 0x808080; // Unrated
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

        await interaction.deferReply();

        const level = difficultyMap[difficultyInput];
        if (!level) {
            return interaction.editReply(
                "❌ 올바른 난이도(예: s3, g1, p5)를 입력해주세요."
            );
        }

        try {
            // Solved.ac API 요청 (정확한 level 필터 적용)
            const apiUrl = `https://solved.ac/api/v3/search/problem?query=solvable:true+level:${level}&page=1`;
            const response = await axios.get(apiUrl);
            const problemData = response.data;

            if (!problemData.items || problemData.items.length === 0) {
                return interaction.editReply(
                    `🤔 해당 난이도(${difficultyInput.toUpperCase()}) 문제를 찾을 수 없습니다.`
                );
            }

            // 완전 랜덤 추출 (API에서 받아온 목록 내에서만)
            const randomIndex = Math.floor(
                Math.random() * problemData.items.length
            );
            const problem = problemData.items[randomIndex];

            const problemId = problem.problemId;
            const title = problem.titleKo || `[문제 ${problemId}]`;
            const problemLevel = problem.level;
            const levelName = getDifficultyName(problemLevel);
            const color = getDifficultyColor(problemLevel);

            const tags = problem.tags
                ? problem.tags
                      .map(
                          (tag) =>
                              `#${
                                  tag.displayNames.find(
                                      (d) => d.language === "ko"
                                  )?.name || tag.displayNames[0].name
                              }`
                      )
                      .join(" ")
                : "없음";

            const embed = new EmbedBuilder()
                .setColor(color)
                .setTitle(`📘 [${problemId}] ${title}`)
                .setURL(`https://www.acmicpc.net/problem/${problemId}`)
                .setDescription(`**추천 난이도:** ${levelName}`)
                .addFields(
                    {
                        name: "문제 번호",
                        value: problemId.toString(),
                        inline: true,
                    },
                    {
                        name: "평균 시도 횟수",
                        value: problem.averageTries?.toFixed(2) || "N/A",
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
                "💥 Solved.ac API 요청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
            );
        }
    },

    // 자동완성
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

        await interaction.respond(
            filtered.map((c) => ({ name: c.toUpperCase(), value: c }))
        );
    },
};
