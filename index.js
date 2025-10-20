// 1. 주요 클래스 가져오기 (기존 코드)
const { Client, Events, GatewayIntentBits } = require("discord.js");
const http = require("http"); // 헬스 체크를 위한 http 모듈 추가

// 2. 환경 변수에서 토큰 가져오기 (config.json 대신)
// Koyeb 대시보드에서 'DISCORD_BOT_TOKEN'이라는 이름으로 실제 토큰을 설정해야 합니다.
const token = process.env.DISCORD_BOT_TOKEN;

// 3. 헬스 체크 서버 설정 (Koyeb에서 24시간 실행을 보장하기 위함)
// Koyeb은 PORT 환경 변수를 제공하며, 0.0.0.0 주소로 리스닝해야 외부에서 접근 가능합니다.
const PORT = process.env.PORT || 8000;

const server = http.createServer((req, res) => {
    // 헬스 체크 요청에 대해 200 OK 응답을 반환합니다.
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Discord Bot is running and healthy!");
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`[HTTP] Health check server listening on port ${PORT}`);
});
// ----------------------------------------------------------------------

// 4. 클라이언트 생성 및 인텐트 (기존 코드)
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// 5. 봇 준비 완료 시 메시지 (기존 코드)
client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// 6. 'messageCreate' 이벤트 리스너 (기존 코드)
client.on("messageCreate", (message) => {
    if (message.content === "ping") {
        message.reply("pong");
    }
});

// 7. 봇 로그인 실행
// 토큰이 환경 변수에 설정되지 않았다면 여기서 오류가 발생합니다.
client.login(token);
