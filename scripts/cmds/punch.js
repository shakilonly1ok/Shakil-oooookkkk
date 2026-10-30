const axios = require("axios");
const fs = require("fs");
const path = require("path");

const mahmud = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "punch",
                aliases: ["hit"],
                version: "1.7",
                author: "MahMUD",
                countDown: 10,
                role: 0,
                description: {
                        en: "Generate an image with your punched one",
                        vi: "Tạo hình ảnh đấm nhau với người khác"
                },
                category: "fun",
                guide: {
                        en: '   {pn} @mention: Mention someone to use',
                        vi: '   {pn} @mention: Đề cập đến ai đó để sử dụng'
                }
        },

        langs: {
                en: {
                        noMention: "× Baby, please mention someone!",
                        success: "𝐇𝐞𝐫𝐞’𝐬 𝐲𝐨𝐮𝐫 𝐢𝐦𝐚𝐠𝐞 𝐛𝐚𝐛𝐲 🐸",
                        error: "× API error: %1. Contact MahMUD for help.\n•WhatsApp: 01836298139"
                },
                vi: {
                        noMention: "× Cưng ơi, hãy đề cập đến ai đó",
                        success: "Ảnh của cưng đây",
                        error: "× API error: %1. Contact MahMUD for help.\n•WhatsApp: 01836298139"
                }
        },

        onStart: async function ({ api, event, message, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author.trim() !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const mentions = Object.keys(event.mentions);
                if (mentions.length === 0) return message.reply(getLang("noMention"));

                const senderID = event.senderID;
                const targetID = mentions[0];
                const imgPath = path.join(__dirname, "cache", `punch_${senderID}_${targetID}.png`);
                if (!fs.existsSync(path.dirname(imgPath))) fs.mkdirSync(path.dirname(imgPath), { recursive: true });

                try {
                     
                        api.setMessageReaction("⏳", event.messageID, () => {}, true);
                        
                        const response = await axios.post(`${await mahmud()}/api/punch`, 
                                { senderID, targetID }, 
                                { responseType: "arraybuffer" }
                        );

                        fs.writeFileSync(imgPath, Buffer.from(response.data, "binary"));

                        return message.reply({
                                body: getLang("success"),
                                attachment: fs.createReadStream(imgPath)
                        }, () => {
                                api.setMessageReaction("✅", event.messageID, () => {}, true);
                                if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
                        });

                } catch (err) {
                        console.error("punch Error:", err);
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
                        return message.reply(getLang("error", err.message));
                }
        }
};
