import { REST, Routes, SlashCommandBuilder } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const commands = [
  new SlashCommandBuilder()
    .setName("status")
    .setDescription("Mostra o status do servidor Minecraft"),
  
  new SlashCommandBuilder()
    .setName("serverip")
    .setDescription("Mostra o IP do servidor Minecraft"),
  
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Mostra os comandos disponíveis")
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