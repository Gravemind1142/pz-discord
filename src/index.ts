import { Client, Events } from "discord.js";
import { commands } from "./commands";
import { deployCommands, deployCommandsForGuild } from "./deploy-commands";
import { config, prisma, rcon } from "@/lib/config";

export const client = new Client({
  intents: ["Guilds", "GuildMessages", "DirectMessages"],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  console.log("node start done");

  deployCommands();

  // revive cycle
  setInterval(async () => {
    let dateNow = new Date();
    let twentyMinutesAgo = new Date(dateNow.getTime() - 20 * 60 * 1000);

    const revivableUsers = await prisma.user.findMany({
      where: {
        dead: true,
        died_at: {
          lte: twentyMinutesAgo,
        },
      },
    });

    if (revivableUsers.length === 0) return;

    rcon
      .session(async (c) => {
        for (const v of revivableUsers) {
          console.log(`Reviving ${v.username}`);
          await rcon.send(`adduser "${v.username}" "${v.password}"`);
        }
      })
      .then(() => console.log("Revive cycle complete"), console.error);

    await prisma.user.updateMany({
      data: {
        dead: false,
      },
      where: {
        dead: true,
        died_at: {
          lte: twentyMinutesAgo,
        },
      },
    });
  }, 60 * 1000);
});

client.on(Events.GuildCreate, async (guild) => {
  await deployCommandsForGuild({ guildId: guild.id });
});

client.on(Events.InteractionCreate, async (interaction) => {
  console.log(interaction);

  if (!interaction.isChatInputCommand()) {
    return;
  }
  const { commandName } = interaction;
  if (commands[commandName as keyof typeof commands]) {
    commands[commandName as keyof typeof commands].execute(interaction);
  }
});

client.login(config.DISCORD_TOKEN);
