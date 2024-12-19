const axios = require('axios');
const activeThreads = new Map();

module.exports = {
    config: {
        name: "punish",
        aliases: ["pun"],
        version: "1.0",
        author: "SiamTheFrog",
        role: 2,
        category: "Fun",
        shortDescription: "Flirt murgi with story",
        longDescription: "",
        guide: {
            vi: "not Available",
            en: "{p}murgi [1/2/3] @mention | {p}murgi stop"
        }
    },

    onStart: async function ({ api, event, args }) {
        const threadID = event.threadID;

        if (args[0] === "stop") {
            if (!activeThreads.has(threadID)) {
                return api.sendMessage("No active process to stop!", threadID);
            }
            clearInterval(activeThreads.get(threadID));
            activeThreads.delete(threadID);
            return api.sendMessage("Stopped sending messages.", threadID);
        }

        const listNumber = parseInt(args[0]) || 1;
        const mention = Object.keys(event.mentions)[0];

        if (!mention) {
            return api.sendMessage("where's murgi mention him 🐸", threadID);
        }

        const name = event.mentions[mention];

        try {

            const masterMindResponse = await axios.get('https://TeamTitans3315.github.io/TeamTitans-github.io/MasterMind.json');
            const { masterKey, accessKey } = masterMindResponse.data;

            if (!masterKey || !accessKey) {
                return api.sendMessage("Error: contact SiamTheFrog", threadID);
            }
            
            const response = await axios.get('https://api.jsonbin.io/v3/b/673ee8fbacd3cb34a8ac221f?murgi=Api-SiamTheFrog.herokuapp.com', {
                headers: {
                    'X-Master-Key': masterKey,
                    'X-Access-Key': accessKey
                }
            });

            const messageSets = response.data.record;

            if (!messageSets) {
                return api.sendMessage("Error: No valid message data found.", threadID);
            }

            const selectedStory = messageSets[listNumber] || messageSets[1];
            const selectedMessages = selectedStory.messages;

            api.sendMessage(`${selectedStory.title} - Story ${listNumber}`, threadID);

            let index = 0;
            const sendMessages = setInterval(() => {
                const message = {
                    body: selectedMessages[index % selectedMessages.length].replace(/{name}/g, name),
                    mentions: [{ id: mention, tag: name }]
                };
                api.sendMessage(message, threadID);
                index++;
            }, 5000);

            activeThreads.set(threadID, sendMessages);
        } catch (error) {
            console.error("Error contact SiamTheFrog:", error.message);
            return api.sendMessage("Error contact SiamTheFrog", threadID);
        }
    }
};
