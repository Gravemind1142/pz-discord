import { admins, rcon } from "@/lib/config";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { RconError } from "rcon-ts";

export const data = new SlashCommandBuilder()
  .setName("rcon")
  .setDescription("Send an RCON command")
  .addStringOption((option) =>
    option
      .setName("cmd")
      .setDescription("The command to send")
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const cmd = interaction.options.getString("cmd");

  if (!admins.includes(interaction.user.id) || interaction.inGuild())
    return interaction.reply({ content: "Forbidden access" });

  if (!cmd)
    return interaction.reply({
      content: "No command provided",
      ephemeral: true,
    });

  const response = await rcon
    .session((c) => c.send(cmd))
    .catch((error: RconError) => {
      return `RconError: ${error.message}`;
    });

  return interaction.reply({ content: response });
}
