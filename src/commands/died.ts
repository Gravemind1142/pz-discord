import { prisma } from "@/lib/config";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("died")
  .setDescription(
    "Report that you died. Your login will be restored after 20 minutes."
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const myUser = await prisma.user.findFirst({
    where: {
      discord_id: interaction.user.id,
      dead: false
    },
  });

  if (!myUser)
    return interaction.reply({ content: "Forbidden access or not dead", ephemeral: true });

  const date = new Date();

  await prisma.user.update({
    data: {
      dead: true,
      died_at: date.toISOString(),
    },
    where: {
      discord_id: interaction.user.id,
    },
  });

  return interaction.reply(
    `Death confirmed, login will be restored at <t:${Math.floor(
      (date.valueOf() / 1000) + (20 * 60)
    )}:t>`
  );
}
