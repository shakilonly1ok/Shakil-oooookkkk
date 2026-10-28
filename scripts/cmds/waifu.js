const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "waifu",

    aliases: ["gif"],

    version: "4.1.0",

    author: "AMMAN",

    role: 0,

    cooldown: 20,

    description:
      "Get random anime images and GIFs",

    category: "anime",

    guide:
      "{pn} [category]"
  },

  async onStart({
    api,
    event,
    args
  }) {

    // =====================================================
    // IMAGE CATEGORIES
    // =====================================================

    const imageCategories = [
      "waifu",
      "neko",
      "husbando",
      "kitsune"
    ];

    // =====================================================
    // GIF CATEGORIES
    // =====================================================

    const gifCategories = [
      "angry",
      "baka",
      "bite",
      "bleh",
      "blowkiss",
      "blush",
      "bonk",
      "bored",
      "carry",
      "clap",
      "confused",
      "cry",
      "cuddle",
      "dance",
      "facepalm",
      "feed",
      "handhold",
      "handshake",
      "happy",
      "highfive",
      "hug",
      "kabedon",
      "kick",
      "kiss",
      "lappillow",
      "laugh",
      "lurk",
      "nod",
      "nom",
      "nope",
      "nya",
      "pat",
      "peck",
      "poke",
      "pout",
      "punch",
      "run",
      "salute",
      "shake",
      "shoot",
      "shocked",
      "shrug",
      "sip",
      "slap",
      "sleep",
      "smile",
      "smug",
      "spin",
      "stare",
      "tableflip",
      "teehee",
      "think",
      "thumbsup",
      "tickle",
      "wag",
      "wave",
      "wink",
      "yawn",
      "yeet"
    ];

    // =====================================================
    // DETECT COMMAND
    // =====================================================

    const commandName =
      event.body
        ?.trim()
        ?.split(/\s+/)[0]
        ?.replace(
          /^[^a-zA-Z0-9]+/,
          ""
        )
        ?.toLowerCase();

    const isGifCommand =
      commandName === "gif";

    const isWaifuCommand =
      commandName === "waifu";

    // =====================================================
    // CATEGORY ARGUMENT
    // =====================================================

    let category =
      args &&
      args[0]
        ? String(args[0])
            .toLowerCase()
            .trim()
        : null;

    // =====================================================
    // CATEGORY LIST
    // =====================================================

    if (
      category === "list" ||
      category === "categories" ||
      category === "help"
    ) {

      const text =
        "🌸 𝗪𝗔𝗜𝗙𝗨 𝗦𝗬𝗦𝗧𝗘𝗠 𝗩𝟰\n" +
        "━━━━━━━━━━━━━━━━━━\n\n" +

        " 🖼️ 𝗜𝗠𝗔𝗚𝗘𝗦\n\n" +

        "• " +
        imageCategories.join(
          " • "
        ) +

        "\n\n" +

        " 🎞️ 𝗚𝗜𝗙𝗦\n\n" +

        "• " +
        gifCategories.join(
          " • "
        ) +

        "\n\n" +

        "━━━━━━━━━━━━━━━━━━\n" +

        "📌 Usage:\n\n" +

        " -waifu\n" +
        " -waifu neko\n\n" +

        " -gif\n" +
        " -gif hug";

      return api.sendMessage(
        text,
        event.threadID,
        event.messageID
      );
    }

    // =====================================================
    // DEFAULT CATEGORY
    // =====================================================

    /*
     * -waifu
     * → random waifu image
     *
     * -gif
     * → random GIF category
     */

    if (!category) {

      if (isGifCommand) {

        category =
          gifCategories[
            Math.floor(
              Math.random() *
              gifCategories.length
            )
          ];

      } else {

        category =
          "waifu";
      }
    }

    // =====================================================
    // VALIDATE WAIFU
    // =====================================================

    if (isWaifuCommand) {

      if (
        !imageCategories.includes(
          category
        )
      ) {

        return api.sendMessage(

          "❌ Invalid image category.\n\n" +

          "🖼️ Available:\n" +

          imageCategories.join(
            " • "
          ) +

          "\n\nExample:\n" +

          "-waifu\n" +
          "-waifu neko\n" +
          "-waifu husbando\n" +
          "-waifu kitsune",

          event.threadID,
          event.messageID
        );
      }
    }

    // =====================================================
    // VALIDATE GIF
    // =====================================================

    else if (isGifCommand) {

      if (
        !gifCategories.includes(
          category
        )
      ) {

        return api.sendMessage(

          "❌ Invalid GIF category.\n\n" +

          "🎞️ Available:\n" +

          gifCategories.join(
            " • "
          ) +

          "\n\nExample:\n" +

          "-gif\n" +
          "-gif hug\n" +
          "-gif kiss\n" +
          "-gif dance\n" +
          "-gif wink",

          event.threadID,
          event.messageID
        );
      }
    }

    // =====================================================
    // UNKNOWN COMMAND
    // =====================================================

    else {

      return api.sendMessage(

        "❌ Use one of these commands:\n\n" +

        "🖼️ -waifu\n" +
        "🎞️ -gif",

        event.threadID,
        event.messageID
      );
    }

    // =====================================================
    // REACTION: LOADING
    // =====================================================

    api.setMessageReaction(
      "⏳",
      event.messageID,
      () => {},
      true
    );

    let filePath = null;

    try {

      // =================================================
      // API REQUEST
      // =================================================

      const apiURL =
        `https://nekos.best/api/v2/${category}`;

      const response =
        await axios.get(
          apiURL,
          {
            timeout: 30000,

            headers: {
              "User-Agent":
                "HahariBot"
            }
          }
        );

      // =================================================
      // RESULT
      // =================================================

      const result =
        response.data
          ?.results
          ?.[0];

      const imageURL =
        result?.url;

      if (!imageURL) {

        throw new Error(
          "No media URL returned by Nekos.best"
        );
      }

      // =================================================
      // DETECT FILE TYPE
      // =================================================

      let extension = ".jpg";

      const lowerURL =
        imageURL.toLowerCase();

      if (
        lowerURL.includes(
          ".gif"
        )
      ) {

        extension = ".gif";

      } else if (
        lowerURL.includes(
          ".png"
        )
      ) {

        extension = ".png";

      } else if (
        lowerURL.includes(
          ".webp"
        )
      ) {

        extension = ".webp";
      }

      // =================================================
      // CACHE
      // =================================================

      const cacheDir =
        path.join(
          __dirname,
          "cache"
        );

      await fs.ensureDir(
        cacheDir
      );

      filePath =
        path.join(
          cacheDir,

          `waifu_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2, 8)}${extension}`
        );

      // =================================================
      // DOWNLOAD
      // =================================================

      const mediaResponse =
        await axios.get(
          imageURL,
          {
            responseType:
              "arraybuffer",

            timeout:
              60000,

            maxContentLength:
              30 * 1024 * 1024,

            maxBodyLength:
              30 * 1024 * 1024,

            headers: {
              "User-Agent":
                "HahariBot"
            }
          }
        );

      await fs.writeFile(
        filePath,
        mediaResponse.data
      );

      // =================================================
      // DETERMINE MEDIA TYPE
      // =================================================

      const isGif =
        extension === ".gif";

      // =================================================
      // REACTION: MEDIA READY
      // =================================================

      api.setMessageReaction(
        isGif
          ? "🎞️"
          : "🖼️",

        event.messageID,

        () => {},

        true
      );

      // =================================================
      // MESSAGE
      // =================================================

      let body =
        isGif
          ? `🎞️ Here's your random ${category} GIF!`
          : `🌸 Here's your random ${category} image!`;

      // =================================================
      // ARTIST
      // =================================================

      if (
        result?.artist_name
      ) {

        body +=
          `\n🎨 Artist: ${result.artist_name}`;
      }

      // =================================================
      // ANIME
      // =================================================

      if (
        result?.anime_name
      ) {

        body +=
          `\n🎬 Anime: ${result.anime_name}`;
      }

      // =================================================
      // SEND
      // =================================================

      api.sendMessage(
        {
          body,

          attachment:
            fs.createReadStream(
              filePath
            )
        },

        event.threadID,

        (err) => {

          if (err) {

            console.error(
              `[WAIFU] Send error (${category}):`,
              err
            );

            // ---------------------------------------------
            // REACTION: ERROR
            // ---------------------------------------------

            api.setMessageReaction(
              "❌",
              event.messageID,
              () => {},
              true
            );

          } else {

            // ---------------------------------------------
            // REACTION: SUCCESS
            // ---------------------------------------------

            api.setMessageReaction(
              "✅",
              event.messageID,
              () => {},
              true
            );
          }

          // =================================================
          // CLEANUP
          // =================================================

          setTimeout(
            async () => {

              try {

                if (
                  filePath &&
                  await fs.pathExists(
                    filePath
                  )
                ) {

                  await fs.remove(
                    filePath
                  );
                }

              } catch (
                cleanupError
              ) {

                console.error(
                  "[WAIFU] Cleanup error:",
                  cleanupError.message
                );
              }

            },
            5000
          );
        },

        event.messageID
      );

    } catch (error) {

      // =====================================================
      // ERROR LOG
      // =====================================================

      console.error(
        "\n========== WAIFU V4.1 ERROR =========="
      );

      console.error(
        "Command:",
        commandName
      );

      console.error(
        "Category:",
        category
      );

      console.error(
        "Message:",
        error.message
      );

      console.error(
        "Status:",
        error.response?.status
      );

      console.error(
        "Response:",
        error.response?.data
      );

      console.error(
        "=======================================\n"
      );

      // =====================================================
      // CLEANUP
      // =====================================================

      if (filePath) {

        try {

          if (
            await fs.pathExists(
              filePath
            )
          ) {

            await fs.remove(
              filePath
            );
          }

        } catch {}
      }

      // =====================================================
      // REACTION: ERROR
      // =====================================================

      api.setMessageReaction(
        "❌",
        event.messageID,
        () => {},
        true
      );

      // =====================================================
      // ERROR MESSAGE
      // =====================================================

      return api.sendMessage(

        `❌ Couldn't fetch "${category}" right now.\n\n` +
        "Please try again later.",

        event.threadID,
        event.messageID
      );
    }
  }
};
