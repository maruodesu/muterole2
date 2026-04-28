const {
  Client,
  GatewayIntentBits,
} = require("discord.js");

const TOKEN = process.env.BOT_TOKEN;
const MUTE_ROLE_ID = process.env.MUTE_ROLE_ID;

if (!TOKEN) {
  console.error("BOT_TOKEN が設定されていません");
  process.exit(1);
}

if (!MUTE_ROLE_ID) {
  console.error("MUTE_ROLE_ID が設定されていません");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.once("ready", () => {
  console.log(`ログイン完了: ${client.user.tag}`);
});

client.on("voiceStateUpdate", async (oldState, newState) => {
  try {
    const member = newState.member;

    if (!member) return;
    if (member.user.bot) return;

    // 通話に入っていない場合は無視
    if (!newState.channelId) return;

    const wasSelfMuted = oldState.selfMute;
    const isSelfMuted = newState.selfMute;

    // セルフミュート OFF → ON
    if (!wasSelfMuted && isSelfMuted) {
      if (!member.roles.cache.has(MUTE_ROLE_ID)) {
        await member.roles.add(MUTE_ROLE_ID, "セルフミュート検知");
        console.log(`${member.user.tag} にロールを付与しました`);
      }
    }

    // セルフミュート ON → OFF
    if (wasSelfMuted && !isSelfMuted) {
      if (member.roles.cache.has(MUTE_ROLE_ID)) {
        await member.roles.remove(MUTE_ROLE_ID, "セルフミュート解除検知");
        console.log(`${member.user.tag} からロールを削除しました`);
      }
    }
  } catch (error) {
    console.error("voiceStateUpdate error:", error);
  }
});

client.login(TOKEN);
