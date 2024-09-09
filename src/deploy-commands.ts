import { REST, Routes } from "discord.js";
import { config } from "@/lib/config";
import { commands } from "./commands";

const commandsData = Object.values(commands).map((command) => command.data);

const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

type DeployCommandsProps = {
  guildId: string;
};

export async function deployCommandsForGuild({ guildId }: DeployCommandsProps) {
  try {
    console.log(
      `Started refreshing application (/) commands for guild ${guildId}`
    );

    await rest.put(
      Routes.applicationGuildCommands(config.DISCORD_CLIENT_ID, guildId),
      {
        body: commandsData,
      }
    );

    console.log(
      `Successfully reloaded application (/) commands for guild ${guildId}`
    );
  } catch (error) {
    console.error(error);
  }
}

export async function deployCommands() {
  try {
    console.log("Started refreshing application (/) commands globally.");

    await rest.put(Routes.applicationCommands(config.DISCORD_CLIENT_ID), {
      body: commandsData,
    });

    console.log("Successfully reloaded application (/) commands globally.");
  } catch (error) {
    console.error(error);
  }
}
