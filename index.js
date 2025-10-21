const { Client, Events, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");
const http = require("http");

const token = process.env.DISCORD_BOT_TOKEN;
const PORT = process.env.PORT || 8000;

const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Discord Bot is running and healthy!");
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`[HTTP] Health check server listening on port ${PORT}`);
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

client.commands = new Collection();

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

client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand() && !interaction.isAutocomplete())
        return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        if (interaction.isAutocomplete()) {
            if (command.autocomplete) {
                await command.autocomplete(interaction);
            }
            return;
        }

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

client.login(token);
