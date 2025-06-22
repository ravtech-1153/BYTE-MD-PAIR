const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');
const { ByteID } = require('./id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const {
    default: Byte,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers
} = require("maher-zubair-baileys");

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = ByteID();
    let num = req.query.number;
    let attempt = 0; // Counter for retry attempts

    async function Byte_Pair() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            let Hamza = Byte({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: ["Chrome (Linux)", "", ""]
            });

            if (!Hamza.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await Hamza.requestPairingCode(num);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            Hamza.ev.on('creds.update', saveCreds);
            Hamza.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;
                if (connection == "open") {
                    // Send initial message after linking
                    let initialMessage = `*_Sending session id, Wait..._*`;
                    await Hamza.sendMessage(Hamza.user.id, { text: initialMessage });

                    await delay(20000); // Delay for 5 seconds before sending the session

                    let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                    await delay(800); // Small delay before processing the credentials

                    // Encode credentials to base64 and send session message
                    let b64data = Buffer.from(data).toString('base64');
                    let session = await Hamza.sendMessage(Hamza.user.id, { text: 'Byte;;;' + b64data });
await delay(8000)
                    // Send final BYTE_MD_TEXT message
                BWM-XMD;;;H4sIAAAAAAAAA61Ua4+iSBT9K5v6qhl5v5JOFlABRQXx0brZDyWUUMqriwLFif99gt2908nMzvQmy6fiUtx7zr3n3K8gL3CFpqgF2ldQEtxAirojbUsENGDUxyMioA8iSCHQQD3aGsWsEJsxnph0Hw38obGeSPPBKbCHFe+uVPfiWKPLLd89gXsflPUhxeEvEsrP7WArGOxC3zxfJ+nBCcNmOTha54N3pUNUq5E3t5KpmAezJ3DvMkJMcB6PygRliMB0iloPYvI5+PE4GNhNr1DxtZkHPXuwdvenm1tCLns2rVR3g+UO82Quby+fg28H89aw6E60BQ/Zsj/jJoJz4m6MvnfO6viWlRZqRGujxqNX+BWOcxQ5Ecoppu2n+55NA+kqLEdh7t8SPqaGtMs5F04DW77QohUnC+5FkJzxZfNJ4MraRcMzn4bWbntakcgMdFqGbko3wpXYKysO6c3aM7fLxv8I3CPvWjn/l75PzbXa4Cm66GUtLtVwZ7M1d12Kfplm5dkX7LFeTJ9r1d4qn4NfLUp3aRL9xJ1zb5/bRyVaqDGSML/BtVGj836ziN2Id5L4O3xIa/IrlCfmuo28zHc8PuDTXXYrLJ4frjIVDzdr6ZlL+Hi50U1LWI1kOcr8IeMtbmop717G9oppx7scSskqY0prsF8oKyk0jETXnx6Mzqh1IqCx9z4gKMYVJZDiIu9iqtAHMGoCFBJEH90F6l5dXsfVVV6wbfMCd/J0NJFLYT1Z6RVPistwNDGcmxszg8sT6IOSFCGqKhTZuKIFaWeoqmCMKqD99RhUx5mgrKBogiOgAU4UZEZSWV5QuD+rL5cE0gqW5ZccUdAHR1JkMwQ0SmrUB48fdFaRdEU2DF0VWdbkRIXhDXPEKSNW5yVm2DHMXouucIYqCrMSaKwsMoKiKqp47/8/ODiV41lFGY95cagrQ07Wx4Ko6CYriabODM3f4JDvf/dBjq70VcZd83m2D46YVHSd12VawOhd4+8fYRgWdU6DNg/N7oAI0D6EEaU4j6uOWZ1DEia4QWbHA2hHmFbon3kjgqJ3Lm87zCyiTobD6VTdzDYB6LB3iX7ojSYyP7YnfVxTFZllJVblJEWSxe5iF++DHHa5wBZmMEF/BCjHBem684a7KxMhCnFaAQ2YrhdIu/NwNMk4LnQsSx/Fuhnr4DvPd/u86rOZ4eXFcyWyTmfBYbK1RV9Mp5XlxRPzJvHP+dK0ZeygeTp6+kkSoIGN0rvlrtQEXM2R43G5O1/jSDqIvQ2SDokTz0l5NWeLQzrzGpNytt8bq0wTbGd+FLg7SxaIuBCm/D7eqqVTnnuBbA9M/6mrFqEGh+hjsXBfnGZcIlJn/oKMEyyW+/o5DMyMGOzKKOaFso8ZQxpLHC2rHvFaT1qk0d66rK0AhifeLbZW2FwHJ07vtdtei/BKMN6M/Vgs6dtCx2+ew4/XI0aP/fg2i99O9BV4Jzzm3v+Q423j/svWMg435xwO294LO1mNsnaT9NaLfUCMk2D6VY+yIuMnPQHbp/0S3DsHlCmkx4JkQAMwj0jxEAwp6k7JTn4sflHM1GPH8F+Zp7Ci+nd3/MxwzOstjxSlDasEaICdCoktdFJv9bIMKKTvZgN691gLFdy/AayCwsCWCAAA_`;
                    await Hamza.sendMessage(Hamza.user.id, { text: Byte_MD_TEXT }, { quoted: session });

                    await delay(100); // Delay before closing connection
                    await Hamza.ws.close(); // Close the WebSocket connection
                    return await removeFile('./temp/' + id); // Remove the temporary files
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    if (attempt < 1) { // Retry only once
                        attempt++;
                        await delay(10000); // Wait before retrying
                        Byte_Pair(); // Retry connection
                    } else {
                        console.log("Max retry attempts reached");
                        await removeFile('./temp/' + id);
                        if (!res.headersSent) {
                            await res.send({ code: "Service Unavailable" });
                        }
                    }
                }
            });
        } catch (err) {
            console.log("Service error:", err);
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: "Service Unavailable" });
            }
        }
    }

    return await Byte_Pair();
});

module.exports = router;
