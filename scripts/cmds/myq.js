const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "myqueen",
                version: "2.7",
                author: "MahMUD",
                category: "love",
                guide: "{pn} @mention | reply | UID"
        },
        langs: {
                bn: {
                        noTarget: "❌ কাউকে মেনশন করুন, রিপ্লাই দিন বা UID দিন আপনার কুইন বানাতে!",
                        success: "𝐐𝐮𝐞𝐞𝐧 𝐨𝐟 𝐦𝐲 𝐡𝐞𝐚𝐫𝐭, 𝐫𝐮𝐥𝐞𝐫 𝐨𝐟 𝐦𝐲 𝐰𝐨𝐫𝐥𝐝 👸\n• %1\n• %2",
                        error: "× API error: %1. Contact shakil for help.\n•WhatsApp:dibo na"
                },
                en: {
                        noTarget: "❌ Mention, reply, or give UID to make someone your Queen!",
                        success: "𝐐𝐮𝐞𝐞𝐧 𝐨𝐟 𝐦𝐲 𝐡𝐞𝐚𝐫𝐭, 𝐫𝐮𝐥𝐞𝐫 𝐨𝐟 𝐦𝐲 𝐰𝐨𝐫𝐥𝐝 👸\n• %1\n• %2",
                        error: "× API error: %1. Contact shakil for help.\n•WhatsApp: dibo na"
                }
        },

        onStart: async function ({ api, usersData, event, args, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) return api.sendMessage("Unauthorized.", event.threadID);

                const senderID = event.senderID;
                const mention = Object.keys(event.mentions)[0];
                let target = mention || (event.messageReply && event.messageReply.senderID) || (args[0] && /^\d+$/.test(args[0]) ? args[0] : null);

                if (!target) return api.sendMessage(getLang("noTarget"), event.threadID, event.messageID);

                const file = path.join(__dirname, "cache", `myqueen_${senderID}_${Date.now()}.png`);
                if (!fs.existsSync(path.dirname(file))) fs.mkdirSync(path.dirname(file), { recursive: true });

                try {
                        const info1 = await usersData.get(senderID);
                        const info2 = await usersData.get(target);
                        const apiUrl = await baseApiUrl();
                        const { data } = await axios.get(`${apiUrl}/api/pair/mahmud?user1=${senderID}&user2=${target}&style=26`, { responseType: "arraybuffer" });

                        fs.writeFileSync(file, Buffer.from(data));
                        return api.sendMessage({
                                body: getLang("success", info1.name, info2.name),
                                attachment: fs.createReadStream(file)
                        }, event.threadID, () => fs.unlinkSync(file), event.messageID);
                } catch (err) {
                        if (fs.existsSync(file)) fs.unlinkSync(file);
                        return api.sendMessage(getLang("error", err.message), event.threadID, event.messageID);
                }
        }
};
