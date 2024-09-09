import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import Rcon from "rcon-ts";

dotenv.config();

const {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  RCON_HOST,
  RCON_PORT,
  RCON_PASSWORD,
} = process.env;

if (
  !DISCORD_TOKEN ||
  !DISCORD_CLIENT_ID ||
  !RCON_HOST ||
  !RCON_PORT ||
  !RCON_PASSWORD
) {
  throw new Error("Missing environment variables");
}

export const config = {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
};

export const rcon = new Rcon({
  host: RCON_HOST,
  port: Number(RCON_PORT),
  password: RCON_PASSWORD,
  timeout: 3000,
});

export const admins = (process.env.ADMIN_USER_IDS || "")
  .split(",")
  .map((id) => id.trim());

export const prisma = new PrismaClient();
