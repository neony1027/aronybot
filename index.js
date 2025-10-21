const { Client, Events, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");
const http = require("http");

// 1. 토큰 및 헬스 체크 설정 (Koyeb 배포용)
const token = process.env.DISCORD_BOT_TOKEN;
const PORT = process.env.PORT || 8000;

// Koyeb Deep Sleep 방지를 위한 HTTP 서버 생성 (24시간 구동 유지)
const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Discord Bot is running and healthy!");
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`[HTTP] Health check server listening on port ${PORT}`);
});

// 2. 클라이언트 및 명령어 컬렉션 생성
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers, // 관리 명령어(나가기, 응징)에 필수 인텐트
    ],
});

client.commands = new Collection();

// 3. 명령어 파일 로드
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    try {
        const command = require(filePath);
        if ("data" in command && "execute" in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(
                `[경고] ${filePath}의 명령어에 필수 속성(data 또는 execute)이 없습니다.`
            );
        }
    } catch (error) {
        console.error(`[오류] 명령어 파일 로드 실패: ${filePath}`, error);
    }
}

// 4. 이벤트 핸들러
client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// 5. 상호작용 이벤트 처리 (핵심 로직)
client.on(Events.InteractionCreate, async (interaction) => {
    // 채팅 명령어와 자동 완성 상호작용만 처리
    if (!interaction.isChatInputCommand() && !interaction.isAutocomplete())
        return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        // 5-1. 자동 완성 상호작용 처리 (/문제추천의 난이도 입력에 사용됨)
        if (interaction.isAutocomplete()) {
            if (command.autocomplete) {
                await command.autocomplete(interaction);
            }
            return;
        }

        // 5-2. 채팅 명령어 실행
        await command.execute(interaction);
    } catch (error) {
        console.error(error);

        // 명령어 실행 중 오류 발생 시 사용자에게 안전하게 알림
        const errorMessage = "명령어 실행 중 오류가 발생했습니다! 😥";

        if (interaction.replied || interaction.deferred) {
            // 이미 응답했거나 deferReply로 대기 중인 경우 followUp 사용
            await interaction.followUp({
                content: errorMessage,
                ephemeral: true,
            });
        } else {
            // 아직 응답하지 않은 경우 reply 사용 (3초 제한 준수)
            await interaction.reply({ content: errorMessage, ephemeral: true });
        }
    }
});

// 6. 봇 로그인
client.login(token);
