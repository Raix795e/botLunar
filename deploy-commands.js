const notificarCommand = new SlashCommandBuilder()
  .setName("notificar")
  .setDescription("Receber notificação por DM quando o servidor abrir/ficar online");
const whitelistCommand = new SlashCommandBuilder()
  .setName("whitelist")
  .setDescription("Gerencia a whitelist do servidor (admins)")
  .addSubcommand(sub =>
    sub.setName("add")
      .setDescription("Adicionar jogador à whitelist")
      .addStringOption(opt =>
        opt.setName("jogador")
          .setDescription("Nick do jogador")
          .setRequired(true)))
  .addSubcommand(sub =>
    sub.setName("remove")
      .setDescription("Remover jogador da whitelist")
      .addStringOption(opt =>
        opt.setName("jogador")
          .setDescription("Nick do jogador")
          .setRequired(true)));

const banCommand = new SlashCommandBuilder()
  .setName("ban")
  .setDescription("Gerencia banimentos do servidor (admins)")
  .addSubcommand(sub =>
    sub.setName("add")
      .setDescription("Banir jogador do servidor")
      .addStringOption(opt =>
        opt.setName("jogador")
          .setDescription("Nick do jogador")
          .setRequired(true)))
  .addSubcommand(sub =>
    sub.setName("remove")
      .setDescription("Remover banimento de jogador")
      .addStringOption(opt =>
        opt.setName("jogador")
          .setDescription("Nick do jogador")
          .setRequired(true)));
import { REST, Routes, SlashCommandBuilder } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const commands = [
  new SlashCommandBuilder()
    .setName("status")
    .setDescription("Mostra o status do servidor Minecraft"),
  new SlashCommandBuilder()
    .setName("jogadores")
    .setDescription("Mostra a lista de jogadores online no servidor Minecraft"),
  new SlashCommandBuilder()
    .setName("top")
    .setDescription("Mostra o ranking do servidor (kills, saldo, etc)"),
  new SlashCommandBuilder()
    .setName("serverip")
    .setDescription("Mostra o IP do servidor Minecraft"),
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Mostra os comandos disponíveis"),
  whitelistCommand,
  banCommand,
  notificarCommand
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log("🚀 Registrando comandos...");
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log("✅ Comandos registrados com sucesso!");
  } catch (error) {
    console.error(error);
  }
})();