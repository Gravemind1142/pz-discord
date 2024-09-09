import { prisma, rcon } from "@/lib/config";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { RconError } from "rcon-ts";

export const data = new SlashCommandBuilder()
  .setName("list")
  .setDescription("Lists users on the pz server");

export async function execute(interaction: ChatInputCommandInteraction) {
  console.log("interaction recieved");
  const dbUsers = await prisma.user.findMany({
    select: {
      username: true,
      discord_id: true,
    },
  });

  console.log("dbUsers completed")

  const dbResponse = dbUsers
    .map((v) => `${v.username} - <@${v.discord_id}>`)
    .join("\n");

  console.log(dbResponse)

  const rconResponse = await rcon
    .session((c) => c.send("players"))
    .catch((error: RconError) => {
      return `RconError: ${error.message}`;
    });

  console.log(rconResponse)

  return interaction.reply(`${rconResponse}\n\nWhitelist:\n${dbResponse}`);
}
