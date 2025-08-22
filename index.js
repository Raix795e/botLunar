import fs from "fs";
// Funções utilitárias para notificação
const NOTIFICAR_FILE = "./notificar.json";
function getNotificarList() {
  try {
    return JSON.parse(fs.readFileSync(NOTIFICAR_FILE, "utf8"));
  } catch {
    return [];
  }
}
function saveNotificarList(list) {
  fs.writeFileSync(NOTIFICAR_FILE, JSON.stringify(list, null, 2));
}
let notifiedOnline = false;
  if (interaction.commandName === "notificar") {
    const userId = interaction.user.id;
    let list = getNotificarList();
    if (list.includes(userId)) {
      list = list.filter(id => id !== userId);
      saveNotificarList(list);
      await interaction.reply({ content: "🔕 Você não receberá mais notificações quando o servidor abrir.", ephemeral: true });
    } else {
      list.push(userId);
      saveNotificarList(list);
      await interaction.reply({ content: "🔔 Você será notificado por DM quando o servidor abrir!", ephemeral: true });
    }
  }
import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import { status } from "minecraft-server-util";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once("ready", async () => {
  console.log(`✅ Logado como ${client.user.tag}`);

  let statusMessageId = process.env.STATUS_MESSAGE_ID || null;
  const statusChannelId = process.env.STATUS_CHANNEL_ID;

  // Função para criar o embed de status
  const makeStatusEmbed = (server, online = true) => {
    return new EmbedBuilder()
      .setColor(online ? "#43b581" : "#ed4245")
      .setTitle("🌙 LunarCraft Status")
      .setThumbnail(process.env.LUNARCRAFT_LOGO || null)
      .addFields(
        { name: "IP", value: process.env.MC_IP, inline: true },
        { name: "Porta", value: process.env.MC_PORT || "25565", inline: true },
        { name: "Versão", value: online ? server.version.name : "-", inline: true },
        { name: "Jogadores Online", value: online ? `${server.players.online}/${server.players.max}` : "0", inline: true }
      )
      .setDescription(online ? "🟢 Servidor Online" : "🔴 Servidor Offline")
      .setTimestamp();
  };

  // Atualiza o status do bot e a mensagem fixa no canal
  const updateStatus = async () => {
    let server = null;
    let online = true;
    try {
      server = await status(process.env.MC_IP, parseInt(process.env.MC_PORT || "25565"));
      client.user.setActivity(`🌙 Online: ${server.players.online}/${server.players.max}`, { type: 0 });
    } catch {
      online = false;
      client.user.setActivity("🔴 Offline", { type: 0 });
    }

    // Notificação de abertura do servidor
    if (online && !notifiedOnline) {
      const list = getNotificarList();
      for (const userId of list) {
        try {
          const user = await client.users.fetch(userId);
          await user.send("🌙 O servidor Minecraft está ONLINE! Entre agora!");
        } catch {}
      }
      notifiedOnline = true;
    }
    if (!online) {
      notifiedOnline = false;
    }

    // Atualiza embed no canal de status
    if (statusChannelId) {
      try {
        const channel = await client.channels.fetch(statusChannelId);
        if (!channel || !channel.isTextBased()) return;
        let statusMsg = null;
        if (statusMessageId) {
          try {
            statusMsg = await channel.messages.fetch(statusMessageId);
          } catch {}
        }
        const embed = makeStatusEmbed(server, online);
        if (statusMsg) {
          await statusMsg.edit({ embeds: [embed] });
        } else {
          statusMsg = await channel.send({ embeds: [embed] });
          statusMessageId = statusMsg.id;
          // Opcional: salvar statusMessageId em algum lugar persistente
        }
      } catch (e) {
        console.error("Erro ao atualizar mensagem de status:", e);
      }
    }
  };
  updateStatus();
  setInterval(updateStatus, 60 * 1000);
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

  if (interaction.commandName === "jogadores") {
    await interaction.deferReply();
    try {
      const server = await status(process.env.MC_IP, parseInt(process.env.MC_PORT || "25565"));
      let jogadores = server.players.sample && server.players.sample.length > 0
        ? server.players.sample.map(p => `• ${p.name}`).join("\n")
        : "Ninguém online no momento.";
      const embed = new EmbedBuilder()
        .setColor("#43b581")
        .setTitle("👥 Jogadores Online")
        .setDescription(jogadores)
        .setFooter({ text: `Total: ${server.players.online}/${server.players.max}` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply("❌ Não foi possível consultar os jogadores online.");
    }
  }

  if (interaction.commandName === "serverip") {
    await interaction.reply(`🌍 **IP do servidor:** \`${process.env.MC_IP}:${process.env.MC_PORT || "25565"}\``);
  }

  if (interaction.commandName === "top") {
    await interaction.deferReply();
    // Simulação de ranking (substitua por integração real quando possível)
    const topKills = [
      { nick: "Steve", kills: 42 },
      { nick: "Alex", kills: 35 },
      { nick: "Herobrine", kills: 28 }
    ];
    const topSaldo = [
      { nick: "Steve", saldo: 1500 },
      { nick: "Alex", saldo: 1200 },
      { nick: "Herobrine", saldo: 900 }
    ];
    const embed = new EmbedBuilder()
      .setColor("#f1c40f")
      .setTitle("🏆 Ranking do Servidor")
      .addFields(
        { name: "Top Kills", value: topKills.map((p, i) => `#${i+1} ${p.nick} - ${p.kills} kills`).join("\n"), inline: false },
        { name: "Top Saldo", value: topSaldo.map((p, i) => `#${i+1} ${p.nick} - ${p.saldo} sonhos`).join("\n"), inline: false }
      )
      .setFooter({ text: "Ranking fictício para demonstração" })
      .setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  }

  // Comando simulado de whitelist
  if (interaction.commandName === "whitelist") {
    if (!interaction.memberPermissions || !interaction.memberPermissions.has('Administrator')) {
      await interaction.reply({ content: '❌ Você não tem permissão para usar este comando.', ephemeral: true });
      return;
    }
    const action = interaction.options.getSubcommand();
    const jogador = interaction.options.getString('jogador');
      if (action === 'add') {
        await interaction.reply(`✅ Jogador \`${jogador}\` adicionado à whitelist (simulado).`);
      } else if (action === 'remove') {
        await interaction.reply(`✅ Jogador \`${jogador}\` removido da whitelist (simulado).`);

    }
  // Comando simulado de ban
  if (interaction.commandName === "ban") {
    if (!interaction.memberPermissions || !interaction.memberPermissions.has('Administrator')) {
      await interaction.reply({ content: '❌ Você não tem permissão para usar este comando.', ephemeral: true });
      return;
    }
    const action = interaction.options.getSubcommand();
    const jogador = interaction.options.getString('jogador');
      if (action === 'add') {
        await interaction.reply(`⛔ Jogador \`${jogador}\` banido do servidor (simulado).`);
      } else if (action === 'remove') {
        await interaction.reply(`✅ Banimento removido de \`${jogador}\` (simulado).`);

    }
  if (interaction.commandName === "help") {
    await interaction.reply("📜 **Comandos disponíveis:**\n`/status` - Status do servidor\n`/jogadores` - Jogadores online\n`/top` - Ranking do servidor\n`/serverip` - Mostra o IP\n`/help` - Lista de comandos");
  }
});

client.login(process.env.BOT_TOKEN);