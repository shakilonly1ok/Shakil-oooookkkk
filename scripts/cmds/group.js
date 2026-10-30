const fs = require("fs-extra");
const request = require("request");

module.exports = {
        config: {
                name: "group",
                version: "1.7",
                author: "MahMUD",
                countDown: 10,
                role: 1,
                description: {
                        bn: "গ্রুপের বিভিন্ন সেটিংস পরিবর্তন এবং তথ্য দেখুন",
                        en: "See Box info and changes",
                        vi: "Xem thông tin nhóm và thay đổi"
                },
                category: "box chat",
                guide: {
                        bn: "   {pn} [name/emoji/image/info]",
                        en: "   {pn} [name/emoji/image/info]",
                        vi: "   {pn} [name/emoji/image/info]"
                }
        },

        langs: {
                bn: {
                        usage: "আপনি ব্যবহার করতে পারেন:\n/group emoji [আইকন]\n\n/group name [গ্রুপের নাম]\n\n/group image [ইমেজে রিপ্লাই করুন]\n\n/group info => গ্রুপের সব তথ্য!",
                        botNotAdmin: "× এই কাজটি করতে বটের গ্রুপ এডমিন পারমিশন প্রয়োজন!",
                        userNotAdmin: "× আপনি গ্রুপের এডমিন নন!",
                        noPower: "× আপনার এই কমান্ডটি ব্যবহার করার ক্ষমতা নেই!",
                        replyImage: "× আপনাকে অবশ্যই একটি ছবি, অডিও বা ভিডিওতে রিপ্লাই করতে হবে!",
                        onlyOneImage: "× দয়া করে শুধুমাত্র একটি ফাইল সিলেক্ট করে রিপ্লাই করুন!",
                        infoBody: "গ্রুপের নাম: %1\nগ্রুপ আইডি: %2\n%3 মেম্বার অ্যাপ্রুভাল: %4\nইমোজি: %5\n- তথ্যসমূহ:\nসর্বমোট মেম্বার: %6 জন\nছেলে: %7 জন\nমেয়ে: %8 জন\n\nসর্বমোট %9 জন এডমিন:\n%10\nমোট মেসেজ সংখ্যা: %11 টি।"
                },
                en: {
                        usage: "You can use:\n/group emoji [icon]\n\n/group name [the box name]\n\n/group image [reply to an image]\n\n/group info => All group information!",
                        botNotAdmin: "× BOT needs admin permission to perform this action!",
                        userNotAdmin: "× You are not a box admin!",
                        noPower: "× You don't have the power to use this command!",
                        replyImage: "× You must reply to a certain audio, video, or photo!",
                        onlyOneImage: "Please reply to only one audio, video, or photo!",
                        infoBody: "GC Name: %1\nGC ID: %2\n%3 Approve: %4\nEmoji: %5\n-Information:\nTotal %6 members\nMale %7 members\nFemale: %8 members\n\nWith %9 Administrators include:\n%10\nTotal number of messages: %11 msgs."
                },
                vi: {
                        usage: "Bạn có thể sử dụng:\n/group emoji [icon]\n\n/group name [tên nhóm]\n\n/group image [phản hồi ảnh]\n\n/group info => Tất cả thông tin nhóm!",
                        botNotAdmin: "× BOT cần quyền quản trị viên để thực hiện việc này!",
                        userNotAdmin: "× Bạn không phải là quản trị viên nhóm!",
                        noPower: "× Bạn không có quyền sử dụng lệnh này!",
                        replyImage: "× Bạn phải phản hồi một âm thanh, video hoặc hình ảnh cụ thể!",
                        onlyOneImage: "Vui lòng chỉ phản hồi một âm thanh, video hoặc hình ảnh!",
                        infoBody: "Tên nhóm: %1\nID nhóm: %2\n%3 Phê duyệt: %4\nBiểu tượng: %5\n-Thông tin:\nTổng %6 thành viên\nNam %7 thành viên\nNữ: %8 thành viên\n\nVới %9 Quản trị viên bao gồm:\n%10\nTổng số tin nhắn: %11."
                }
        },

        onStart: async function ({ api, event, args, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author.trim() !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                if (args.length == 0) return api.sendMessage(getLang("usage"), event.threadID, event.messageID);

                if (args[0] == "name") {
                        var content = args.join(" ");
                        var c = content.slice(4, 99) || (event.messageReply ? event.messageReply.body : "");
                        if (c) api.setTitle(`${c}`, event.threadID);
                }

                if (args[0] == "emoji") {
                        const name = args[1] || (event.messageReply ? event.messageReply.body : "");
                        if (name) api.changeThreadEmoji(name, event.threadID);
                }

                if (args[0] == "me") {
                        if (args[1] == "admin") {
                                const threadInfo = await api.getThreadInfo(event.threadID);
                                const find = threadInfo.adminIDs.find(el => el.id == api.getCurrentUserID());
                                if (!find) return api.sendMessage(getLang("botNotAdmin"), event.threadID, event.messageID);
                                
                                if (!global.GoatBot.config.adminBot.includes(event.senderID)) {
                                        return api.sendMessage(getLang("noPower"), event.threadID, event.messageID);
                                }
                                return api.changeAdminStatus(event.threadID, event.senderID, true);
                        }
                }

                if (args[0] == "image") {
                        if (event.type !== "message_reply") return api.sendMessage(getLang("replyImage"), event.threadID, event.messageID);
                        if (!event.messageReply.attachments || event.messageReply.attachments.length == 0) return api.sendMessage(getLang("replyImage"), event.threadID, event.messageID);
                        if (event.messageReply.attachments.length > 1) return api.sendMessage(getLang("onlyOneImage"), event.threadID, event.messageID);

                        var callback = () => api.changeGroupImage(fs.createReadStream(__dirname + "/cache/1.png"), event.threadID, () => fs.unlinkSync(__dirname + "/cache/1.png"));
                        return request(encodeURI(event.messageReply.attachments[0].url)).pipe(fs.createWriteStream(__dirname + '/cache/1.png')).on('close', () => callback());
                }

                if (args[0] == "info") {
                        var threadInfo = await api.getThreadInfo(event.threadID);
                        let threadMem = threadInfo.participantIDs.length;
                        var gendernam = [];
                        var gendernu = [];
                        var nope = [];
                        
                        for (let z in threadInfo.userInfo) {
                                var gioitinhone = threadInfo.userInfo[z].gender;
                                var nName = threadInfo.userInfo[z].name;

                                if (gioitinhone == 'MALE') {
                                        gendernam.push(z + gioitinhone);
                                } else if (gioitinhone == 'FEMALE') {
                                        gendernu.push(gioitinhone);
                                } else {
                                        nope.push(nName);
                                }
                        }
                        
                        var nam = gendernam.length;
                        var nu = gendernu.length;
                        let qtv = threadInfo.adminIDs.length;
                        let sl = threadInfo.messageCount;
                        let icon = threadInfo.emoji || "None";
                        let threadName = threadInfo.threadName || "No Name";
                        let id = threadInfo.threadID;
                        var listad = '';
                        var qtv2 = threadInfo.adminIDs;
                        
                        for (let i = 0; i < qtv2.length; i++) {
                                try {
                                        const infu = (await api.getUserInfo(qtv2[i].id));
                                        const name = infu[qtv2[i].id].name;
                                        listad += ' • ' + name + '\n';
                                } catch (e) {
                                        listad += ' • ID: ' + qtv2[i].id + '\n';
                                }
                        }
                        
                        let sex = threadInfo.approvalMode;
                        var pd = sex == false ? 'Turn off' : 'Turn on';
                        var pdd = sex == false ? '❎' : '✅';
                        
                        var callback = () => api.sendMessage({
                                body: getLang("infoBody", threadName, id, pdd, pd, icon, threadMem, nam, nu, qtv, listad, sl),
                                attachment: fs.createReadStream(__dirname + '/cache/1.png')
                        }, event.threadID, () => fs.unlinkSync(__dirname + '/cache/1.png'), event.messageID);

                        if (threadInfo.imageSrc) {
                                return request(encodeURI(`${threadInfo.imageSrc}`))
                                        .pipe(fs.createWriteStream(__dirname + '/cache/1.png'))
                                        .on('close', () => callback());
                        } else {
                                return api.sendMessage(getLang("infoBody", threadName, id, pdd, pd, icon, threadMem, nam, nu, qtv, listad, sl), event.threadID, event.messageID);
                        }
                }
        }
};
