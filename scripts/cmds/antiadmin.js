const fs = require('fs');

function loadAdmin() {
        try {
                const data = fs.readFileSync("admin.json", "utf8");
                return JSON.parse(data);
        } catch (e) {
                return {};
        }
}

function saveAdmin(data) {
        fs.writeFileSync("admin.json", JSON.stringify(data, null, 2));
}

let adminData = loadAdmin();

module.exports = {
        config: {
                name: "antiadmin",
                version: "1.0",
                author: "MahMUD",
                countDown: 5,
                role: 1,
                category: "box",
                guide: "{pn} off | on"
        },

        langs: {
                bn: {
                        disabled: "✅ | এন্টি-এডমিন সিস্টেম বন্ধ করা হয়েছে।",
                        enabled: "✅ | এন্টি-এডমিন সিস্টেম চালু করা হয়েছে।",
                        usage: "❌ | ব্যবহারবিধি: {pn} off বা on"
                },
                en: {
                        disabled: "✅ | Anti-admin system disabled.",
                        enabled: "✅ | Anti-admin system enabled.",
                        usage: "❌ | Usage: {pn} off or on"
                },
                vi: {
                        disabled: "✅ | Hệ thống chống admin đã bị tắt.",
                        enabled: "✅ | Hệ thống chống admin đã được bật.",
                        usage: "❌ | Cách dùng: {pn} off hoặc on"
                }
        },

        onStart: async function({ message, event, args, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) return message.reply("Unauthorized.");

                if (args[0] === "off") {
                        adminData[event.threadID] = 'off';
                        saveAdmin(adminData);
                        return message.reply(getLang("disabled"));
                } else if (args[0] === "on") {
                        delete adminData[event.threadID];
                        saveAdmin(adminData);
                        return message.reply(getLang("enabled"));
                } else {
                        return message.reply(getLang("usage", { pn: this.config.name }));
                }
        },

        onEvent: async function({ api, event }) {
                if (adminData[event.threadID] === 'off' || !event.logMessageData || event.logMessageData.ADMIN_EVENT !== "remove_admin") {
                        return;
                }

                const threadID = event.threadID;
                const targetID = event.logMessageData.TARGET_ID;
                const authorID = event.author;

                try {
                        if (authorID !== api.getCurrentUserID() && targetID !== api.getCurrentUserID()) {
                                await api.changeAdminStatus(threadID, targetID, true);
                                await api.changeAdminStatus(threadID, authorID, false);
                        }
                } catch (error) {
                        console.error("Anti-Admin Error:", error);
                }
        }
};
