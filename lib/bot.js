const axios = require("axios");

const status = require("../utils/status");
const diskinfo = require("../utils/diskinfo");
const humanTime = require("../utils/humanTime");
const { uploadFileStream } = require("../utils/gdrive");

const api = process.env.SEARCH_SITE || "https://torrent-aio-bot.herokuapp.com/";
console.log("Using api: ", api);

const searchRegex = /\/search (1337x) (.+)/;
const detailsRegex = /\/details (1337x) (.+)/;
const downloadRegex = /\/mirror (.+)/;
const statusRegex = /\/status (.+)/;
const removeRegex = /\/hapus (.+)/;
const passwotRegex = /\/passwot (.+)/;

const startMessage = `
Halo mas, Perkenalkeun nama saya MOCyy, berikut adalah beberapa perintah untuk mainin aku~:

/kepo - nampilin tulisan ini

/search {situs} {katakunci} - Untuk mencari torrent
Katakunci adalah apa yang ingin mas cari
misalnya nih.
    /search 1337x batman

/details {situs} {link} - Untuk mendapatkan detail torrent
tautan adalah tautan ke halaman torrent
misalnya.
    /detail Piratebay https://bayunblocked.net/torrent/.....

/mirror {magnet link} - Untuk genjot, eh donlot torrent nya mas.
misalnya nih.
    /download magnet:?xt=urn:btih:dedekememesah

/status {magnet link} - Untuk memeriksa status unduhan mas nya tadi
dari hash info yang dipakai untuk unduh tadi
misalnya.
    /status magnet:?xt=guci:btih:dedekememesah

/hapus {magnet link} - Untuk membuang begitu saja torrent yang sudah ditambahkan
misalnya.
    /hapus magnet:?xt=guci:btih:dedekememesah
	
/passwot - untuk nampilin passwot GDrive Public

Untuk mengunggah file, kirim file mas ke sini atau japri aku ya mas, nanti akan
Mocy langsung uplot ke https://drive.helmajs.my.id/1:/

Kalo butuh info aku lainnya, ini cara nya:

/status server
/waktu operasi server
/informasi disk server

Mainin aku mas~ :)
`;

function bot(torrent, bot) {
  bot.onText(/\/kepo/, async msg => {
    bot.sendMessage(msg.chat.id, startMessage);
  });

  bot.on("message", async msg => {
    if (!msg.document) return;
    const chatId = msg.chat.id;
    const mimeType = msg.document.mimeType;
    const fileName = msg.document.file_name;
    const fileId = msg.document.file_id;

    bot.sendMessage(chatId, "📤 Uploading file...");
    try {
      const uploadedFile = await uploadFileStream(fileName, bot.getFileStream(fileId));
      const driveId = uploadedFile.data.id;
      const driveLink = `https://drive.google.com/file/d/${driveId}/view?usp=sharing`;
      const publicLink = `https://drive.helmajs.my.id/1:/${fileName}/${fileName}`;
      bot.sendMessage(chatId, `${fileName} udah selesai aku donlot mas\nGoogle Drive: ${driveLink}\nDrive Publik: ${publicLink}`);
    } catch (e) {
      bot.sendMessage(chatId, e.message || "Yah, gak bisa mas 🥺");
    }
  });

  bot.onText(/\/server diskinfo (.+)/, async (msg, match) => {
    const from = msg.chat.id;
    const path = match[1];
    const info = await diskinfo(path);
    bot.sendMessage(from, info);
  });

  bot.onText(/\/server uptime/, async msg => {
    const from = msg.chat.id;
    bot.sendMessage(from, humanTime(process.uptime() * 1000));
  });

  bot.onText(/\/server status/, async msg => {
    const from = msg.chat.id;
    const currStatus = await status();
    bot.sendMessage(from, currStatus);
  });

  bot.onText(searchRegex, async (msg, match) => {
    var from = msg.from.id;
    var site = match[1];
    var query = match[2];

    bot.sendMessage(from, "🔍 Sedang mencari nih...");

    const data = await axios(`${api}api/v1/search/${site}?query=${query}`).then(({ data }) => data);

    if (!data || data.error) {
      bot.sendMessage(from, "Yah, servernya error mas 🥺");
    } else if (!data.results || data.results.length === 0) {
      bot.sendMessage(from, "❌ Gak ketemu eh mas.");
    } else if (data.results.length > 0) {
      let results1 = "";
      let results2 = "";
      let results3 = "";

      data.results.forEach((result, i) => {
        if (i <= 2) {
          results1 += `Nama: ${result.name} \nSeeds: ${result.seeds} \nDetail: ${result.details} \nLink: ${result.link} \n\n`;
        } else if (2 < i && i <= 5) {
          results2 += `Nama: ${result.name} \nSeeds: ${result.seeds} \nDetail: ${result.details} \nLink: ${result.link} \n\n`;
        } else if (5 < i && i <= 8) {
          results3 += `Nama: ${result.name} \nSeeds: ${result.seeds} \nDetail: ${result.details} \nLink: ${result.link} \n\n`;
        }
      });

      bot.sendMessage(from, results1);
      bot.sendMessage(from, results2);
      bot.sendMessage(from, results3);
    }
  });

  bot.onText(detailsRegex, async (msg, match) => {
    var from = msg.from.id;
    var site = match[1];
    var query = match[2];

    bot.sendMessage(from, "⏱️ Sebentar...");

    const data = await axios(`${api}/details/${site}?query=${query}`).then(({ data }) => data);
    if (!data || data.error) {
      bot.sendMessage(from, "Yah gak bisa mas 🥺");
    } else if (data.torrent) {
      const torrent = data.torrent;
      let result1 = "";
      let result2 = "";

      result1 += `Judul 🏷️: ${torrent.title} \n\nInfo: ${torrent.info}`;
      torrent.details.forEach(item => {
        result2 += `${item.infoTitle} ${item.infoText} \n\n`;
      });
      result2 += "Magnet Link 🧲:";

      await bot.sendMessage(from, result1);
      await bot.sendMessage(from, result2);
      await bot.sendMessage(from, torrent.downloadLink);
    }
  });

  bot.onText(downloadRegex, (msg, match) => {
    var from = msg.from.id;
    var link = match[1];
    let messageObj = null;
    let torrInterv = null;

    const reply = async torr => {
      let mess1 = "";
      mess1 += `Nama 🏷️: ${torr.name}\n\n`;
      mess1 += `Status 📱: ${torr.status}\n\n`;
      mess1 += `Ukuran 📏: ${torr.total}\n\n`;
      if (!torr.done) {
        mess1 += `Terunduh ✅: ${torr.downloaded}\n\n`;
        mess1 += `Kecepatan 🚀: ${torr.speed}\n\n`;
        mess1 += `Progress 📥: ${torr.progress}%\n\n`;
        mess1 += `Perikiraan ⏳: ${torr.redableTimeRemaining}\n\n`;
      } else {
        mess1 += `Download Link 🔗: ${torr.downloadLink}\n\n`;
        clearInterval(torrInterv);
        torrInterv = null;
      }
      mess1 += `Magnet URI 🧲: ${torr.magnetURI}`;
      try {
        if (messageObj) {
          if (messageObj.text !== mess1) bot.editMessageText(mess1, { chat_id: messageObj.chat.id, message_id: messageObj.message_id });
        } else messageObj = await bot.sendMessage(from, mess1);
      } catch (e) {
        console.log(e.message);
      }
    };

    const onDriveUpload = (torr, url) => bot.sendMessage(from, `${torr.name} sudah aku uploadin ke Google Drive nih 📁:\n${url} \n\n kunjungi GDrive`);
    const onDriveUploadStart = torr => bot.sendMessage(from, `📤 Lagi aku uploadin nih mas si ${torr.name} ke Gdrive...`);

    if (link.indexOf("magnet:") !== 0) {
      bot.sendMessage(from, "❌ Lah ini bukan MAGNET, gimana sih mas?");
    } else {
      bot.sendMessage(from, "✔️ Memulai unduhan...");
      try {
        const torren = torrent.download(
          link,
          torr => reply(torr),
          torr => reply(torr),
          onDriveUpload,
          onDriveUploadStart
        );
        torrInterv = setInterval(() => reply(torrent.statusLoader(torren)), 5000);
      } catch (e) {
        bot.sendMessage(from, "Lah, error mas 🥺\n" + e.message);
      }
    }
  });

  bot.onText(statusRegex, (msg, match) => {
    var from = msg.from.id;
    var link = match[1];

    const torr = torrent.get(link);
    if (link.indexOf("magnet:") !== 0) {
      bot.sendMessage(from, "LLah ini bukan MAGNET, gimana sih mas? 🧲");
    } else if (!torr) {
      bot.sendMessage(from, "❌ Belum ngunduh nih,");
    } else {
      let mess1 = "";
      mess1 += `Nama 🏷️: ${torr.name}\n\n`;
      mess1 += `Status 📱: ${torr.status}\n\n`;
      mess1 += `Ukuran 📏: ${torr.total}\n\n`;
      if (!torr.done) {
        mess1 += `Terunduh sebanyak ✅: ${torr.downloaded}\n\n`;
        mess1 += `Kecepatan 🚀: ${torr.speed}\n\n`;
        mess1 += `Progress 📥: ${torr.progress}\n\n`;
        mess1 += `Perkiraan ⏳: ${torr.redableTimeRemaining}\n\n`;
      } else {
        mess1 += `Download Link 🔗: ${torr.downloadLink}\n\n`;
      }
      mess1 += `Magnet URI 🧲: ${torr.magnetURI}`;
      bot.sendMessage(from, mess1);
    }
  });

  bot.onText(removeRegex, (msg, match) => {
    var from = msg.from.id;
    var link = match[1];

    try {
      torrent.remove(link);
      bot.sendMessage(from, "Sudah aku hapus mas 🚮");
    } catch (e) {
      bot.sendMessage(from, `${e.message}`);
    }
  });
  bot.onText(passwotRegex, async (msg, match) => {
    var from = msg.from.id;
    var site = match[1];
    var query = match[2];

    bot.sendMessage(from, "🔍 Nih, passwot nya:	User: moc Pass: bot");
    }
  });
}

module.exports = bot;
