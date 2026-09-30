const os = require("os");
const axios = require("axios");

module.exports = {
  config: {
    name: "info",
    version: "1.0.6",
    author: "Sahariya Islam Shakil",
    countDown: 5,
    role: 0,
    shortDescription: "Get bot and owner info with photo",
    longDescription: "Displays information about the bot owner with system statistics and owner photo.",
    category: "system",
    guide: {
      en: "{p}info"
    }
  },

  onStart: async function ({ api, event }) {
    const uptimeSeconds = process.uptime();
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);

    const totalMem = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2);
    const freeMem = (os.freemem() / (1024 * 1024 * 1024)).toFixed(2);
    const usedMem = (totalMem - freeMem).toFixed(2);

    const imageUrl = "https://i.ibb.co.com/sd0RXFXM/image.jpg";

    const message = `╭━━━[ 🤖 GOATBOT INFO ]━━━╮
│
├─ 👑 Owner: Sahariya Islam Shakil
├─ ⚙️ Prefix: /
├─ ⏱ Uptime: ${hours}h ${minutes}m ${seconds}s
├─ 📊 RAM Usage: ${usedMem} GB / ${totalMem} GB
├─ 🖥️ OS: ${os.type()} ${os.arch()}
├─ 🟢 Node.js: ${process.version}
│
╰━━━━━━━━━━━━━━━━━━━━╯`;

    try {
      const response = await axios.get(imageUrl, { responseType: "stream" });
      return api.sendMessage({
        body: message,
        attachment: response.data
      }, event.threadID, event.messageID);
    } catch (error) {
      return api.sendMessage(message, event.threadID, event.messageID);
    }
  }
};
