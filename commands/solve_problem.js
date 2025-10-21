// commands/solve_problem.js

const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios"); // axios 추가

// 난이도 이름 <-> 숫자 매핑
const difficultyMap = {
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

// 난이도 숫자를 예쁜 이름으로 변환하는 함수
function getDifficultyName(level) {
    if (level >= 31) return `Ruby ${level - 30}`;
    if (level >= 26) return `Platinum ${level - 25}`;
    if (level >= 21) return `Diamond ${level - 20}`;
    if (level >= 16) return `Platinum ${level - 15}`;
    if (level >= 11) return `Gold ${level - 10}`;
    if (level >= 6) return `Silver ${level - 5}`;
    if (level >= 1) return `Bronze ${level}`;
    return "Unrated";
}

// 난이도에 따라 임베드 색상 설정
function getDifficultyColor(level) {
    if (level >= 31) return 0xff0000; // Ruby (빨강)
    if (level >= 26) return 0x00d4aa; // Platinum (청록)
    if (level >= 21) return 0x00b4fc; // Diamond (파랑)
    if (level >= 16) return 0xff9900; // Gold (주황)
    if (level >= 11) return 0xffc700; // Silver (노랑)
    if (level >= 6) return 0xaaaaaa; // Bronze (회색)
    return 0x808080; // Unrated (어두운 회색)
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
        ), // 자동 완성 기능을 사용할 수 있도록 설정

    // 자동 완성 기능 (나중에 구현할 예정이지만 일단 넣어둡니다)
    // async autocomplete(interaction) {
    //     // ... (자동 완성 로직은 일단 생략)
    // },

    async execute(interaction) {
        let difficultyInput = interaction.options
            .getString("난이도")
            .toLowerCase();

        // 🚨 3초 타임아웃 방지를 위해 즉시 응답 예약
        await interaction.deferReply();

        // 난이도 매핑 확인
        let level = difficultyMap[difficultyInput];
        if (!level) {
            return interaction.editReply(
                `❌ 올바른 난이도(예: s3, g1, p5)를 입력해주세요.`
            );
        }

        try {
            // Solved.ac API 요청: 특정 난이도의 랜덤 문제 하나를 가져옵니다.
            // URL: /api/v3/search/problem?query=solvable:true+level:L&sort=random&page=1
            const apiUrl = `https://solved.ac/api/v3/search/problem?query=solvable:true+level:${level}&sort=random&page=1`;

            const response = await axios.get(apiUrl);
            const problemData = response.data;

            if (problemData.count === 0 || problemData.items.length === 0) {
                return interaction.editReply(
                    `🤔 해당 난이도(${difficultyInput.toUpperCase()})의 문제를 찾을 수 없습니다.`
                );
            }

            const problem = problemData.items[0]; // 랜덤 정렬했으므로 첫 번째 항목이 랜덤 문제입니다.

            const problemId = problem.problemId;
            const title = problem.title;
            const levelName = getDifficultyName(problem.level);
            const color = getDifficultyColor(problem.level);
            const tags = problem.tags
                ? problem.tags
                      .map((tag) => `#${tag.displayNames[0].name}`)
                      .join(" ")
                : "없음";

            // 결과 임베드 생성
            const problemEmbed = new EmbedBuilder()
                .setColor(color)
                .setTitle(`📌 [${problemId}] ${title}`)
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
                        value: problem.averageTries.toFixed(2),
                        inline: true,
                    },
                    { name: "태그", value: tags, inline: false }
                )
                .setFooter({ text: "Powered by solved.ac API" })
                .setTimestamp();

            await interaction.editReply({ embeds: [problemEmbed] });
        } catch (error) {
            console.error("Solved.ac API 요청 중 오류 발생:", error.message);
            // API 오류 시 사용자에게 알림
            await interaction.editReply(
                `💥 Solved.ac API 요청 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.`
            );
        }
    },
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();

        // 자동 완성 추천 목록 (난이도, 레벨 이름 등을 포함)
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

        // 사용자가 입력한 값에 따라 필터링
        const filtered = choices
            .filter((choice) => choice.startsWith(focusedValue))
            .slice(0, 25);

        await interaction.respond(
            filtered.map((choice) => ({
                name: choice.toUpperCase(),
                value: choice,
            }))
        );
    },
};
