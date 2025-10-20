const { Client, Events, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");
const http = require("http");

// 1. 토큰 및 헬스 체크 설정 (Koyeb 배포를 위해 유지)
const token = process.env.DISCORD_BOT_TOKEN;
const PORT = process.env.PORT || 8000;

const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Discord Bot is running and healthy!");
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`[HTTP] Health check server listening on port ${PORT}`);
});
// ----------------------------------------------------------------------

// 2. 클라이언트 및 명령어 컬렉션 생성
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        // 기존 MessageContent 대신 GuildMembers 인텐트가 관리 기능에 필수
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
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
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(
            `[경고] ${filePath}의 명령어에 필수 속성(data 또는 execute)이 없습니다.`
        );
    }
}

// 4. 이벤트 핸들러
client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// !!! 핑퐁 (messageCreate) 기능 제거 !!!

// 5. 슬래시 명령어 상호작용 처리
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) return;

    try {
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

// 6. 봇 로그인
client.login(token);
