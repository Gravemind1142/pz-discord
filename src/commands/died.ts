import { prisma, using_respawn_system } from "@/lib/config";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("died")
  .setDescription(
    "Report that you died. Your login will be restored after 20 minutes."
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!using_respawn_system) {
    return interaction.reply(
      `You don't need to run this command. Respawn system is disabled.`
    );
  }

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
