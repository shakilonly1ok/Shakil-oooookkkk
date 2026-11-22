module.exports = {
  config: {
    name: "groupinfo",
    aliases: ["ginfo", "boxinfo"],
    version: "1.0",
    author: "Sahariya Islam Shakil",
    countDown: 5,
    role: 0,
    category: "box"
  },
  onStart: async ({ api, event, message }) => {
    try {
      const t = await api.getThreadInfo(event.threadID);
      if (!t.isGroup) return message.reply("Group chat lagbe.");
      const admins = t.adminIDs || [];
      const uMap = Object.fromEntries((t.userInfo || []).map(u => [u.id, u.name]));
      const adminList = admins.length ? admins.map((a, i) => │ ${i + 1}. ${uMap[a.id] || a.id}).join("\n") : "│ None";

      return message.reply(
`╭─🍃 GROUP INFO 🍃─╮
├──────────────────────┤
│ 🍂 Name     : ${t.threadName || "Unnamed"}
│ 🆔 Group ID : ${event.threadID}
│ 👥 Members  : ${t.participantIDs?.length || 0}
│ 👑 Admins   : ${admins.length}
│ 💬 Messages : ${t.messageCount ?? "N/A"}
│ 🛡️ Status   : ${t.approvalMode ? "Approval On" : "Approved"}
├──────────────────────┤
│ 👑 GROUP ADMIN LIST:
${adminList}
├──────────────────────┤
│ 👑 MESSENGER CHATBOT OWNER:
│   Sahariya Islam Shakil
╰──────────────────────╯`);
    } catch {
      return message.reply("Error!");
    }
  }
};
Sent 2m ago
Compose
Write a message...


