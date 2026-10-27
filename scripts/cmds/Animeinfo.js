const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const ANILIST_API = "https://graphql.anilist.co";

module.exports = {
  config: {
    name: "animeinfo",
    aliases: ["aniinfo"],
    version: "1.0.0",
    author: "AMMAN",
    role: 0,
    category: "anime",
    cooldown: 5,
    description: "Search for anime information.",
    guide: "{pn} <anime name>"
  },

  onStart: async function ({ api, event, args }) {
    const {
      threadID,
      messageID
    } = event;

    const search = args.join(" ").trim();

    if (!search) {
      return api.sendMessage(
        "❌ Please enter an anime name.\n\nExample: -animeinfo Solo Leveling",
        threadID,
        () => {},
        messageID
      );
    }

    // ==========================================
    // SEARCH REACTION
    // ==========================================

    try {
      api.setMessageReaction(
        "🔎",
        messageID,
        () => {},
        true
      );
    } catch (e) {}

    try {
      // ========================================
      // ANILIST GRAPHQL QUERY
      // ========================================

      const query = `
        query ($search: String) {
          Page(page: 1, perPage: 1) {
            media(
              search: $search
              type: ANIME
              sort: SEARCH_MATCH
            ) {
              id

              idMal

              title {
                romaji
                english
                native
              }

              description(asHtml: false)

              coverImage {
                extraLarge
                large
              }

              bannerImage

              format
              status
              episodes
              duration

              season
              seasonYear

              averageScore
              popularity

              genres

              studios(isMain: true) {
                nodes {
                  name
                }
              }

              nextAiringEpisode {
                episode
                airingAt
              }

              siteUrl
            }
          }
        }
      `;

      const response = await axios.post(
        ANILIST_API,
        {
          query,
          variables: {
            search
          }
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          timeout: 30000
        }
      );

      // ========================================
      // CHECK GRAPHQL ERRORS
      // ========================================

      if (response.data?.errors) {
        console.error(
          "[ANIMEINFO] GraphQL Error:",
          response.data.errors
        );

        throw new Error(
          "AniList returned an API error."
        );
      }

      const anime =
        response.data?.data?.Page?.media?.[0];

      if (!anime) {
        try {
          api.setMessageReaction(
            "❌",
            messageID,
            () => {},
            true
          );
        } catch (e) {}

        return api.sendMessage(
          `❌ No anime found for "${search}".`,
          threadID,
          () => {},
          messageID
        );
      }

      // ========================================
      // TITLES
      // ========================================

      const english =
        anime.title?.english || null;

      const romaji =
        anime.title?.romaji || "Unknown";

      const native =
        anime.title?.native || null;

      let displayTitle =
        english || romaji;

      // ========================================
      // DESCRIPTION
      // ========================================

      let description =
        anime.description ||
        "No synopsis available.";

      // Remove excessive whitespace
      description =
        description
          .replace(/\s+/g, " ")
          .trim();

      // Limit description length
      if (description.length > 900) {
        description =
          description.substring(0, 897) +
          "...";
      }

      // ========================================
      // STATUS
      // ========================================

      const statusMap = {
        FINISHED: "Finished",
        RELEASING: "Currently Airing",
        NOT_YET_RELEASED: "Not Yet Released",
        CANCELLED: "Cancelled",
        HIATUS: "On Hiatus"
      };

      const status =
        statusMap[anime.status] ||
        anime.status ||
        "Unknown";

      // ========================================
      // FORMAT
      // ========================================

      const formatMap = {
        TV: "TV",
        TV_SHORT: "TV Short",
        MOVIE: "Movie",
        SPECIAL: "Special",
        OVA: "OVA",
        ONA: "ONA",
        MUSIC: "Music"
      };

      const format =
        formatMap[anime.format] ||
        anime.format ||
        "Unknown";

      // ========================================
      // SCORE
      // ========================================

      const score =
        anime.averageScore
          ? `${anime.averageScore}/100`
          : "N/A";

      // ========================================
      // EPISODES
      // ========================================

      const episodes =
        anime.episodes ??
        "Unknown";

      // ========================================
      // DURATION
      // ========================================

      const duration =
        anime.duration
          ? `${anime.duration} min/ep`
          : "Unknown";

      // ========================================
      // SEASON
      // ========================================

      let season = "Unknown";

      if (
        anime.season &&
        anime.seasonYear
      ) {
        season =
          `${anime.season} ${anime.seasonYear}`;
      } else if (anime.seasonYear) {
        season =
          String(anime.seasonYear);
      }

      // ========================================
      // GENRES
      // ========================================

      const genres =
        anime.genres?.length
          ? anime.genres.join(", ")
          : "N/A";

      // ========================================
      // STUDIO
      // ========================================

      const studio =
        anime.studios?.nodes?.length
          ? anime.studios.nodes
              .map(s => s.name)
              .join(", ")
          : "Unknown";

      // ========================================
      // MAL ID
      // ========================================

      const mal =
        anime.idMal
          ? `https://myanimelist.net/anime/${anime.idMal}`
          : "N/A";

      // ========================================
      // NEXT EPISODE
      // ========================================

      let airingInfo = "";

      if (
        anime.nextAiringEpisode
      ) {
        const episode =
          anime.nextAiringEpisode.episode;

        const airingAt =
          anime.nextAiringEpisode.airingAt;

        if (airingAt) {
          const date =
            new Date(
              airingAt * 1000
            );

          airingInfo =
            `\n📅 Next Episode: ${episode}\n` +
            `⏰ Airing: ${date.toUTCString()}`;
        } else {
          airingInfo =
            `\n📅 Next Episode: ${episode}`;
        }
      }

      // ========================================
      // POPULARITY
      // ========================================

      const popularity =
        anime.popularity
          ? anime.popularity.toLocaleString()
          : "N/A";

      // ========================================
      // RESPONSE TEXT
      // ========================================

      let body =
        `🎌 ANIME INFORMATION\n` +
        `━━━━━━━━━━━━━━━━━━━━\n\n` +

        `📺 Title: ${displayTitle}\n` +

        (
          english &&
          romaji !== english
            ? `🔤 Romaji: ${romaji}\n`
            : ""
        ) +

        (
          native
            ? `🇯🇵 Native: ${native}\n`
            : ""
        ) +

        `\n` +

        `🎞️ Type: ${format}\n` +
        `📌 Status: ${status}\n` +
        `📚 Episodes: ${episodes}\n` +
        `⏱️ Duration: ${duration}\n` +
        `🍂 Season: ${season}\n` +
        `⭐ Score: ${score}\n` +
        `🔥 Popularity: ${popularity}\n` +
        `🏢 Studio: ${studio}\n` +
        `🎭 Genres: ${genres}\n` +

        airingInfo +

        `\n\n📝 Synopsis:\n` +
        `${description}\n\n` +

        `🔗 AniList: ${anime.siteUrl || "N/A"}\n` +
        `🔗 MAL: ${mal}\n` +

        `\n━━━━━━━━━━━━━━━━━━━━`;

      // ========================================
      // IMAGE URL
      // ========================================

      const imageURL =
        anime.coverImage?.extraLarge ||
        anime.coverImage?.large;

      // ========================================
      // CACHE DIRECTORY
      // ========================================

      const cacheDir =
        path.join(
          process.cwd(),
          "cache"
        );

      await fs.ensureDir(
        cacheDir
      );

      let imagePath = null;

      // ========================================
      // DOWNLOAD COVER
      // ========================================

      if (imageURL) {
        try {
          const imageResponse =
            await axios.get(
              imageURL,
              {
                responseType:
                  "arraybuffer",
                timeout: 30000
              }
            );

          imagePath =
            path.join(
              cacheDir,
              `anime_${anime.id}_${Date.now()}.jpg`
            );

          fs.writeFileSync(
            imagePath,
            Buffer.from(
              imageResponse.data
            )
          );
        } catch (imageError) {
          console.log(
            "[ANIMEINFO] Cover download failed:",
            imageError.message
          );

          imagePath = null;
        }
      }

      // ========================================
      // SUCCESS REACTION
      // ========================================

      try {
        api.setMessageReaction(
          "✅",
          messageID,
          () => {},
          true
        );
      } catch (e) {}

      // ========================================
      // SEND RESULT
      // ========================================

      if (imagePath) {
        await new Promise(
          (resolve, reject) => {
            api.sendMessage(
              {
                body,

                attachment:
                  fs.createReadStream(
                    imagePath
                  )
              },

              threadID,

              err => {
                try {
                  if (
                    fs.existsSync(
                      imagePath
                    )
                  ) {
                    fs.unlinkSync(
                      imagePath
                    );
                  }
                } catch (e) {}

                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              },

              messageID
            );
          }
        );
      } else {
        return api.sendMessage(
          body,
          threadID,
          () => {},
          messageID
        );
      }

    } catch (error) {

      console.error(
        "========== ANIMEINFO ERROR =========="
      );

      console.error(
        error.response?.data ||
        error.message ||
        error
      );

      console.error(
        "======================================"
      );

      try {
        api.setMessageReaction(
          "❌",
          messageID,
          () => {},
          true
        );
      } catch (e) {}

      return api.sendMessage(
        "❌ Failed to get anime information. AniList may be temporarily unavailable.",
        threadID,
        () => {},
        messageID
      );
    }
  }
};
