-- CreateTable
CREATE TABLE "User" (
    "username" TEXT NOT NULL,
    "discord_id" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "died_at" DATETIME,
    "dead" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("username", "discord_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_discord_id_key" ON "User"("discord_id");
