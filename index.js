import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import { status } from "minecraft-server-util";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once("ready", () => {
  console.log(`✅ Logado como ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "status") {
    await interaction.deferReply();
    try {
      const server = await status(process.env.MC_IP, parseInt(process.env.MC_PORT || "25565"));

      const embed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle("🌙 LunarCraft Status")
        .addFields(
          { name: "IP", value: process.env.MC_IP, inline: true },
          { name: "Porta", value: process.env.MC_PORT || "25565", inline: true },
          { name: "Versão", value: server.version.name, inline: true },
          { name: "Jogadores Online", value: `${server.players.online}/${server.players.max}`, inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply("❌ O servidor está offline ou inacessível.");
    }
  }

  if (interaction.commandName === "serverip") {
    await interaction.reply(`🌍 **IP do servidor:** \`${process.env.MC_IP}:${process.env.MC_PORT || "25565"}\``);
  }

  if (interaction.commandName === "help") {
    await interaction.reply("📜 **Comandos disponíveis:**\n`/status` - Status do servidor\n`/serverip` - Mostra o IP\n`/help` - Lista de comandos");
  }
});

client.login(process.env.BOT_TOKEN);