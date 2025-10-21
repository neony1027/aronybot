const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("문제추천")
        .setDescription("입력한 난이도의 백준 문제를 추천합니다.")
        .addStringOption((option) =>
            option
                .setName("난이도")
                .setDescription("예: B5, S1, G3, platinum, silver 등")
                .setRequired(true)
                .addChoices(
                    { name: "Bronze 5", value: "B5" },
                    { name: "Bronze 4", value: "B4" },
                    { name: "Bronze 3", value: "B3" },
                    { name: "Bronze 2", value: "B2" },
                    { name: "Bronze 1", value: "B1" },
                    { name: "Silver 5", value: "S5" },
                    { name: "Silver 4", value: "S4" },
                    { name: "Silver 3", value: "S3" },
                    { name: "Silver 2", value: "S2" },
                    { name: "Silver 1", value: "S1" },
                    { name: "Gold 5", value: "G5" },
                    { name: "Gold 4", value: "G4" },
                    { name: "Gold 3", value: "G3" },
                    { name: "Gold 2", value: "G2" },
                    { name: "Gold 1", value: "G1" },
                    { name: "Platinum", value: "platinum" },
                    { name: "Diamond", value: "diamond" },
                    { name: "Ruby", value: "ruby" },
                    { name: "Silver", value: "silver" },
                    { name: "Bronze", value: "bronze" },
                    { name: "Gold", value: "gold" }
                )
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const input = interaction.options.getString("난이도");
        const tierMap = {
            B: "bronze",
            S: "silver",
            G: "gold",
            P: "platinum",
            D: "diamond",
            R: "ruby",
        };

        let solvedLevel = "";
        const match = input.match(/^([BSGPDRE])(\d)$/i); // 예: B5, G3 등

        // 1️⃣ "B5" 같은 형식이라면 정확히 변환
        if (match) {
            const tier = tierMap[match[1].toUpperCase()];
            const level = match[2];
            solvedLevel = `${tier}${level}`;
        }
        // 2️⃣ "silver", "gold" 등 티어 이름만 들어온 경우 랜덤 세부 티어 선택
        else {
            const lower = input.toLowerCase();
            if (
                [
                    "bronze",
                    "silver",
                    "gold",
                    "platinum",
                    "diamond",
                    "ruby",
                ].includes(lower)
            ) {
                const randomLevel = Math.floor(Math.random() * 5) + 1; // 1~5
                solvedLevel = `${lower}${randomLevel}`;
            } else {
                await interaction.editReply(
                    "잘못된 난이도 형식입니다! (예: B5, S3, gold, silver)"
                );
                return;
            }
        }

        try {
            const response = await fetch(
                `https://solved.ac/api/v3/search/problem?query=${solvedLevel}&sort=random&direction=desc&limit=1`
            );
            const data = await response.json();

            if (!data.items || data.items.length === 0) {
                await interaction.editReply(
                    `해당 난이도(${input})의 문제를 찾을 수 없습니다.`
                );
                return;
            }

            const problem = data.items[0];

            const embed = new EmbedBuilder()
                .setColor("#3498db")
                .setTitle(
                    `📘 [${problem.problemId}] ${problem.titleKo || "제목없음"}`
                )
                .setURL(`https://www.acmicpc.net/problem/${problem.problemId}`)
                .addFields(
                    {
                        name: "추천 난이도",
                        value: `${solvedLevel.replace(/[0-9]/, " ")} ${
                            solvedLevel.match(/[0-9]/)[0]
                        }`,
                        inline: true,
                    },
                    {
                        name: "문제 번호",
                        value: `${problem.problemId}`,
                        inline: true,
                    },
                    {
                        name: "평균 시도 횟수",
                        value: `${problem.averageTries.toFixed(2)}`,
                        inline: true,
                    }
                )
                .setFooter({ text: "Powered by solved.ac API" })
                .setTimestamp();

            if (problem.tags && problem.tags.length > 0) {
                const tags = problem.tags
                    .map((t) => `#${t.displayNames[0].name}`)
                    .join(" ");
                embed.addFields({ name: "태그", value: tags });
            }

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply(
                "문제를 불러오는 중 오류가 발생했습니다."
            );
        }
    },
};
