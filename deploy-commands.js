const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

const clientId = "1429770357438418964";
const token = process.env.DISCORD_BOT_TOKEN;

if (!token) {//혹시 모르면
    console.error(
        "환경 변수 DISCORD_BOT_TOKEN 또는 clientId가 설정되지 않았습니다. deploy-commands.js를 수정하고 로컬 환경 변수를 설정하세요."
    );
    process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
    try {
        console.log(
            `총 ${commands.length}개의 슬래시 명령어를 디스코드에 등록합니다.`
        );

        // 전역(Global) 명령어 등록
        const data = await rest.put(Routes.applicationCommands(clientId), {
            body: commands,
        });

        console.log(
            `성공적으로 ${data.length}개의 슬래시 명령어를 등록했습니다.`
        );
    } catch (error) {
        console.error(error);
    }
})();
