const { Client, Events, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");
const http = require("http");

// 토큰 및 헬스 체크 설정 ((((Koyeb 배포)0
const token = process.env.DISCORD_BOT_TOKEN;
const PORT = process.env.PORT || 8000;

const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Discord Bot is running and healthy!");
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`[HTTP] Health check server listening on port ${PORT}`);
});

// 클라이언트 및 명령어 컬렉션 생성
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

client.commands = new Collection();

// 명령어 파일 로드..ㅓㅣ
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(
            `[경고] ${filePath}의 명령어에 필수 속성(data 또는 execute)이 없습니다.`
        );
    }
}

// 이벤트 핸들러
// 이벤트 핸들러
client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// 상호작용 이벤트 처리 (수정할 부분)
client.on(Events.InteractionCreate, async (interaction) => {
    // 채팅 명령어와 자동 완성 상호작용만 처리합니다.
    if (!interaction.isChatInputCommand() && !interaction.isAutocomplete())
        return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        // 1. 자동 완성 상호작용 처리
        if (interaction.isAutocomplete()) {
            // 명령어 모듈에 autocomplete 함수가 정의되어 있으면 실행합니다.
            if (command.autocomplete) {
                await command.autocomplete(interaction);
            }
            return;
        }

        // 2. 채팅 명령어 실행
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        const errorMessage = "명령어 실행 중 오류가 발생했습니다! 😥";
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: errorMessage,
                ephemeral: true,
            });
        } else {
            await interaction.reply({ content: errorMessage, ephemeral: true });
        }
    }
});

// 봇 로긴ㄴㄴㄴㄴㄴㄴㄴ
client.login(token);
