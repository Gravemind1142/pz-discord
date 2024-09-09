import { admins, prisma } from "@/lib/config";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("remove")
  .setDescription("Removes a user from the whitelist")
  .addStringOption((option) =>
    option
      .setName("username")
      .setDescription("The username to use for this user")
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const username = interaction.options.getString("username");

  if (!admins.includes(interaction.user.id) || interaction.inGuild())
    return interaction.reply({ content: "Forbidden access", ephemeral: true });

  if (!username)
    return interaction.reply({
      content: "No username provided",
      ephemeral: true,
    });

  await prisma.user.delete({
    where: {
      username: username,
    },
  });

  return interaction.reply(`Deleted ${username}`);
}
