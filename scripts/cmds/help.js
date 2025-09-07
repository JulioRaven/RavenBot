const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;
const doNotDelete = "𝐈𝐓𝐀𝐂𝐇𝐈❤‍🔥𝐃𝐄𝐗𝐓𝐄𝐔𝐑";

module.exports = {
        config: {
                name: "help",
                version: "2.0",
                author: "NTKhang - MarianCross",
                countDown: 5,
                role: 0,
                description: {
                        en: "Voir l'utilisation des commandes"
                },
                category: "info",
                guide: {
                        en: "{pn} [vide | <nom de la commande>]"
                                + "\n   {pn} setmedia: définir un média pour help (répondre à une image/gif/vidéo)"
                                + "\n   {pn} <nom de la commande> [-u | usage | -g | guide]: afficher uniquement le guide d'utilisation"
                                + "\n   {pn} <nom de la commande> [-i | info]: afficher uniquement les informations de la commande"
                                + "\n   {pn} <nom de la commande> [-r | role]: afficher uniquement les permissions de la commande"
                                + "\n   {pn} <nom de la commande> [-a | alias]: afficher uniquement les alias de la commande"
                },
                priority: 1
        },

        langs: {
                en: {
                        helpList: "╭─ 𝐈𝐓𝐀𝐂𝐇𝐈❤‍🔥𝐃𝐄𝐗𝐓𝐄𝐔𝐑 ─╮\n%1\n╰─ Total: %2 commandes ─╯\nUtilisez %3help <cmd> pour les détails de la commande",
                        commandNotFound: "La commande \"%1\" n'existe pas",
                        getInfoCommand: " 🌱 🩸☞INFOS COMMANDE☜🩸 🌱"
                                + "\n│ Nom: %1"
                                + "\n│ Description: %2"
                                + "\n│ Alias: %3"
                                + "\n│ Alias du groupe: %4"
                                + "\n│ Version: %5"
                                + "\n│ Rôle: %6"
                                + "\n│ Cooldown: %7s"
                                + "\n│ Auteur: %8"
                                + "\n🌱 🩸☞ UTILISATION ☜🩸 🌱"
                                + "\n│%9"
                                + "\n🌱 🩸☞ NOTES ☜🩸 🌱"
                                + "\n│ <XXXXX> peut être modifié"
                                + "\n│ [a|b|c] est a ou b ou c"
                                + "\n━━━━━━━━━━━━━━",
                        onlyInfo: "🌱 🩸☞ INFOS ☜🩸 🌱"
                                + "\n│ Nom: %1"
                                + "\n│ Description: %2"
                                + "\n│ Alias: %3"
                                + "\n│ Alias du groupe: %4"
                                + "\n│ Version: %5"
                                + "\n│ Rôle: %6"
                                + "\n│ Cooldown: %7s"
                                + "\n│ Auteur: %8"
                                + "\n━━━━━━━━━━━━━━",
                        onlyUsage: "🌱 🩸☞ UTILISATION ☜🩸 🌱"
                                + "\n│%1"
                                + "\n━━━━━━━━━━━━━━",
                        onlyAlias: "🌱 🩸☞ ALIAS ☜🩸 🌱"
                                + "\n│ Alias: %1"
                                + "\n│ Alias du groupe: %2"
                                + "\n━━━━━━━━━━━━━━",
                        onlyRole: "🌱 🩸☞ RÔLE ☜🩸 🌱"
                                + "\n│%1"
                                + "\n━━━━━━━━━━━━━━",
                        doNotHave: "Aucun",
                        roleText0: "0 (Tous les utilisateurs)",
                        roleText1: "1 (Administrateurs du groupe)",
                        roleText2: "2 (Administrateurs du bot)",
                        roleText0setRole: "0 (défini, tous les utilisateurs)",
                        roleText1setRole: "1 (défini, administrateurs du groupe)"
                }
        },

        onStart: async function ({ message, args, event, threadsData, getLang, role, globalData }) {
                // ———————————————— SET MEDIA ATTACHMENT ——————————————— //
                if (args[0]?.toLowerCase() === "setmedia") {
                        if (event.messageReply?.attachments?.length > 0) {
                                const attachment = event.messageReply.attachments[0];
                                if (attachment.type === "photo" || attachment.type === "video" || attachment.type === "animated_image") {
                                        try {
                                                const helpMediaPath = path.normalize(`${process.cwd()}/assets/help_media.${attachment.type === "photo" ? "jpg" : attachment.type === "video" ? "mp4" : "gif"}`);

                                                // Créer le dossier assets s'il n'existe pas
                                                const assetsDir = path.dirname(helpMediaPath);
                                                if (!fs.existsSync(assetsDir)) {
                                                        fs.mkdirSync(assetsDir, { recursive: true });
                                                }

                                                // Télécharger et sauvegarder le media
                                                const response = await axios.get(attachment.url, { responseType: 'arraybuffer' });
                                                fs.writeFileSync(helpMediaPath, Buffer.from(response.data));

                                                return message.reply("✅ Media pour la commande help défini avec succès !");
                                        } catch (error) {
                                                return message.reply("❌ Erreur lors de la sauvegarde du media : " + error.message);
                                        }
                                } else {
                                        return message.reply("❌ Veuillez répondre à une image, GIF ou vidéo valide.");
                                }
                        } else {
                                return message.reply("❌ Veuillez répondre à un message contenant une image, GIF ou vidéo.");
                        }
                }
                const langCode = await threadsData.get(event.threadID, "data.lang") || global.GoatBot.config.language;
                let customLang = {};
                const pathCustomLang = path.normalize(`${process.cwd()}/languages/cmds/${langCode}.js`);
                if (fs.existsSync(pathCustomLang))
                        customLang = require(pathCustomLang);

                const { threadID } = event;
                const threadData = await threadsData.get(threadID);
                const prefix = getPrefix(threadID);
                const commandName = (args[0] || "").toLowerCase();
                let command = commands.get(commandName) || commands.get(aliases.get(commandName));

                // Check for aliases
                const aliasesData = threadData.data.aliases || {};
                if (!command) {
                        for (const cmdName in aliasesData) {
                                if (aliasesData[cmdName].includes(commandName)) {
                                        command = commands.get(cmdName);
                                        break;
                                }
                        }
                }

                if (!command) {
                        const globalAliasesData = await globalData.get('setalias', 'data', []);
                        for (const item of globalAliasesData) {
                                if (item.aliases.includes(commandName)) {
                                        command = commands.get(item.commandName);
                                        break;
                                }
                        }
                }

                // ———————————————— LIST ALL COMMAND ——————————————— //
                if (!command && !args[0]) {
                        // Mapping des catégories existantes vers les nouvelles catégories
                        const categoryMapping = {
                                // Vos catégories existantes -> nouvelles catégories
                                "ai": "ai",
                                "image": "ai", 
                                "generate": "ai",
                                "bot": "ai",
                                "group": "admin",
                                "admin": "admin",
                                "moderation": "admin",
                                "game": "entertainment",
                                "fun": "entertainment",
                                "entertainment": "entertainment",
                                "music": "media",
                                "download": "media",
                                "media": "media",
                                "video": "media",
                                "utility": "utility",
                                "tool": "utility",
                                "tools": "utility",
                                "search": "utility",
                                "rank": "system",
                                "level": "system",
                                "economy": "system",
                                "info": "system",
                                "system": "system"
                        };

                        // Configuration des catégories finales
                        const categoryConfig = {
                                "ai": { title: "𝗜𝗔" },
                                "admin": { title: "𝗔𝗗𝗠𝗜𝗡𝗜𝗦𝗧𝗥𝗔𝗧𝗜𝗢𝗡" },
                                "entertainment": { title: "𝗗𝗜𝗩𝗘𝗥𝗧𝗜𝗦𝗦𝗘𝗠𝗘𝗡𝗧" },
                                "utility": { title: "𝗨𝗧𝗜𝗟𝗜𝗧𝗔𝗜𝗥𝗘𝗦" },
                                "media": { title: "𝗠𝗘𝗗𝗜𝗔" },
                                "system": { title: "𝗦𝗬𝗦𝗧𝗘𝗠𝗘" }
                        };

                        const categorizedCommands = {};
                        let totalCommands = 0;

                        // Organiser les commandes par catégorie
                        for (const [name, cmdData] of commands) {
                                if (cmdData.config.role > 1 && role < cmdData.config.role)
                                        continue;

                                totalCommands++;
                                const originalCategory = cmdData.config.category?.toLowerCase() || "utility";
                                const mappedCategory = categoryMapping[originalCategory] || "utility";

                                if (!categorizedCommands[mappedCategory]) {
                                        categorizedCommands[mappedCategory] = [];
                                }
                                categorizedCommands[mappedCategory].push(name);
                        }

                        let helpMessage = "";

                        // Construire le message par catégories
                        const orderedCategories = ["ai", "admin", "entertainment", "utility", "media", "system"];

                        for (const category of orderedCategories) {
                                if (categorizedCommands[category] && categorizedCommands[category].length > 0) {
                                        const config = categoryConfig[category];

                                        helpMessage += `\n━━━ ${config.title} ━━━\n`;

                                        // Grouper les commandes par ligne (max 6 par ligne)
                                        const commands = categorizedCommands[category].sort();
                                        const chunked = [];
                                        for (let i = 0; i < commands.length; i += 6) {
                                                chunked.push(commands.slice(i, i + 6));
                                        }

                                        for (const chunk of chunked) {
                                                helpMessage += chunk.join(", ") + "\n";
                                        }
                                }
                        }

                        // Ajouter les commandes des autres catégories non mappées
                        for (const [category, cmdList] of Object.entries(categorizedCommands)) {
                                if (!orderedCategories.includes(category) && cmdList.length > 0) {
                                        helpMessage += `\n━━━ ${category.toUpperCase()} ━━━\n`;
                                        const commands = cmdList.sort();
                                        const chunked = [];
                                        for (let i = 0; i < commands.length; i += 6) {
                                                chunked.push(commands.slice(i, i + 6));
                                        }

                                        for (const chunk of chunked) {
                                                helpMessage += chunk.join(", ") + "\n";
                                        }
                                }
                        }

                        // Ajouter la section support
                        helpMessage += `\n━━━ 𝗦𝗨𝗣𝗣𝗢𝗥𝗧 ━━━\n`;
                        helpMessage += `Rejoignez la boîte d'assistance\n`;
                        helpMessage += `${prefix}callad pour contacter les administrateurs\n`;

                        const finalMessage = getLang("helpList", helpMessage, totalCommands, prefix);

                        // Préparer l'objet de réponse
                        const formSendMessage = { body: finalMessage };

                        // Ajouter un GIF/image si disponible
                        const mediaExtensions = ['.gif', '.jpg', '.jpeg', '.png', '.mp4'];
                        let helpMediaPath = null;

                        for (const ext of mediaExtensions) {
                                const testPath = path.normalize(`${process.cwd()}/assets/help_media${ext}`);
                                if (fs.existsSync(testPath)) {
                                        helpMediaPath = testPath;
                                        break;
                                }
                        }

                        if (helpMediaPath) {
                                formSendMessage.attachment = fs.createReadStream(helpMediaPath);
                        }

                        return message.reply(formSendMessage);
                }
                // ———————————— COMMAND DOES NOT EXIST ———————————— //
                else if (!command && args[0]) {
                        return message.reply(getLang("commandNotFound", args[0]));
                }
                // ————————————————— INFO COMMAND ————————————————— //
                else {
                        const formSendMessage = {};
                        const configCommand = command.config;

                        let guide = configCommand.guide?.[langCode] || configCommand.guide?.["en"];
                        if (guide == undefined)
                                guide = customLang[configCommand.name]?.guide?.[langCode] || customLang[configCommand.name]?.guide?.["en"];

                        guide = guide || { body: "" };
                        if (typeof guide == "string")
                                guide = { body: guide };
                        const guideBody = guide.body
                                .replace(/\{prefix\}|\{p\}/g, prefix)
                                .replace(/\{name\}|\{n\}/g, configCommand.name)
                                .replace(/\{pn\}/g, prefix + configCommand.name);

                        const aliasesString = configCommand.aliases ? configCommand.aliases.join(", ") : getLang("doNotHave");
                        const aliasesThisGroup = threadData.data.aliases ? (threadData.data.aliases[configCommand.name] || []).join(", ") : getLang("doNotHave");

                        let roleOfCommand = configCommand.role;
                        let roleIsSet = false;
                        if (threadData.data.setRole?.[configCommand.name]) {
                                roleOfCommand = threadData.data.setRole[configCommand.name];
                                roleIsSet = true;
                        }

                        const roleText = roleOfCommand == 0 ?
                                (roleIsSet ? getLang("roleText0setRole") : getLang("roleText0")) :
                                roleOfCommand == 1 ?
                                        (roleIsSet ? getLang("roleText1setRole") : getLang("roleText1")) :
                                        getLang("roleText2");

                        const author = configCommand.author;
                        const descriptionCustomLang = customLang[configCommand.name]?.description;
                        let description = checkLangObject(configCommand.description, langCode);
                        if (description == undefined)
                                if (descriptionCustomLang != undefined)
                                        description = checkLangObject(descriptionCustomLang, langCode);
                                else
                                        description = getLang("doNotHave");

                        let sendWithAttachment = false;

                        if (args[1]?.match(/^-g|guide|-u|usage$/)) {
                                formSendMessage.body = getLang("onlyUsage", guideBody.split("\n").join("\n│"));
                                sendWithAttachment = true;
                        }
                        else if (args[1]?.match(/^-a|alias|aliase|aliases$/))
                                formSendMessage.body = getLang("onlyAlias", aliasesString, aliasesThisGroup);
                        else if (args[1]?.match(/^-r|role$/))
                                formSendMessage.body = getLang("onlyRole", roleText);
                        else if (args[1]?.match(/^-i|info$/))
                                formSendMessage.body = getLang(
                                        "onlyInfo",
                                        configCommand.name,
                                        description,
                                        aliasesString,
                                        aliasesThisGroup,
                                        configCommand.version,
                                        roleText,
                                        configCommand.countDown || 1,
                                        author || ""
                                );
                        else {
                                formSendMessage.body = getLang(
                                        "getInfoCommand",
                                        configCommand.name,
                                        description,
                                        aliasesString,
                                        aliasesThisGroup,
                                        configCommand.version,
                                        roleText,
                                        configCommand.countDown || 1,
                                        author || "",
                                        guideBody.split("\n").join("\n│")
                                );
                                sendWithAttachment = true;
                        }

                        if (sendWithAttachment && guide.attachment) {
                                if (typeof guide.attachment == "object" && !Array.isArray(guide.attachment)) {
                                        const promises = [];
                                        formSendMessage.attachment = [];

                                                                                for (const keyPathFile in guide.attachment) {
                                                const pathFile = path.normalize(keyPathFile);

                                                if (!fs.existsSync(pathFile)) {
                                                        const cutDirPath = path.dirname(pathFile).split(path.sep);
                                                        for (let i = 0; i < cutDirPath.length; i++) {
                                                                const pathCheck = `${cutDirPath.slice(0, i + 1).join(path.sep)}${path.sep}`;
                                                                if (!fs.existsSync(pathCheck))
                                                                        fs.mkdirSync(pathCheck);
                                                        }
                                                        const getFilePromise = axios.get(guide.attachment[keyPathFile], { responseType: 'arraybuffer' })
                                                                .then(response => {
                                                                        fs.writeFileSync(pathFile, Buffer.from(response.data));
                                                                });

                                                        promises.push({
                                                                pathFile,
                                                                getFilePromise
                                                        });
                                                }
                                                else {
                                                        promises.push({
                                                                pathFile,
                                                                getFilePromise: Promise.resolve()
                                                        });
                                                }
                                        }

                                        await Promise.all(promises.map(item => item.getFilePromise));
                                        for (const item of promises)
                                                formSendMessage.attachment.push(fs.createReadStream(item.pathFile));
                                }
                        }

                        return message.reply(formSendMessage);
                }
        }
};

function checkLangObject(data, langCode) {
        if (typeof data == "string")
                return data;
        if (typeof data == "object" && !Array.isArray(data))
                return data[langCode] || data.en || undefined;
        return undefined;
                        }
