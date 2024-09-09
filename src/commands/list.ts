import { prisma, rcon } from "@/lib/config";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { RconError } from "rcon-ts";

export const data = new SlashCommandBuilder()
  .setName("list")
  .setDescription("Lists users on the pz server");

export async function execute(interaction: ChatInputCommandInteraction) {
  const dbUsers = await prisma.user.findMany({
    select: {
      username: true,
      discord_id: true,
    },
  });

  const dbResponse = dbUsers
    .map((v) => `${v.username} - <@${v.discord_id}>`)
    .join("\n");

  const rconResponse = await rcon
    .session((c) => c.send("players"))
    .catch((error: RconError) => {
      return `RconError: ${error.message}`;
    });

  return interaction.reply(`${rconResponse}\n\nWhitelist:\n${dbResponse}`);
}
