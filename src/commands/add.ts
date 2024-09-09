import { admins, prisma, rcon } from "@/lib/config";
import { generatePassword } from "@/lib/password";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { RconError } from "rcon-ts";

export const data = new SlashCommandBuilder()
  .setName("add")
  .setDescription("Adds a user to the pz server")
  .addUserOption((option) =>
    option
      .setName("user")
      .setDescription("The discord user tied to this user")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("username")
      .setDescription("The username to use for this user")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("password")
      .setDescription("The password to use for this user")
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const targetUser = interaction.options.getUser("user");
  const username = interaction.options.getString("username");
  const password = interaction.options.getString("password") || generatePassword(12);

  if (!admins.includes(interaction.user.id) || interaction.inGuild())
    return interaction.reply({ content: "Forbidden access", ephemeral: true });

  if (!targetUser || !username)
    return interaction.reply({
      content: "No user/username provided",
      ephemeral: true,
    });

  await interaction.deferReply();

  let rconStatus = "Sending cmd...";
  let dbStatus = "Creating...";
  interaction.editReply(`RCON: ${rconStatus}\nDB: ${dbStatus}`);

  const cmd = `adduser "${username}" "${password}"`;

  const response = await rcon
    .session((c) => c.send(cmd))
    .catch((error: RconError) => {
      return `RconError: ${error.message}`;
    });

  rconStatus = `Created username: ${username} password: ${password}`;

  const alreadyExists = response.includes("name already exists");

  if (alreadyExists) {
    rconStatus = response;
  }

  if (response.startsWith("RconError")) {
    rconStatus = response;
    dbStatus = "Cancelled";
    interaction.editReply(`RCON: ${rconStatus}\nDB: ${dbStatus}`);
    return;
  }

  interaction.editReply(`RCON: ${rconStatus}\nDB: ${dbStatus}`);

  try {
    await prisma.user.create({
      data: {
        discord_id: targetUser.id,
        username: username,
        password: password
      },
    });
    dbStatus = "Created";
  } catch (err) {
    const error = err as Error
    let errorMsg = error.message;
    if (error.message.includes("Unique constraint failed")) {
      errorMsg = "Duplicate entry found"
    }
    dbStatus = errorMsg;
  }

  return interaction.editReply(`RCON: ${rconStatus}\nDB: ${dbStatus}`);
}
