const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.post("/download", async (req, res) => {
    const url = req.body.url;

    if (!url) {
        return res.status(400).json({
            error: "URL inválida"
        });
    }

    const file = `audio_${Date.now()}.mp3`;

    const command =
        `yt-dlp -x --audio-format mp3 -o "${file}" "${url}"`;

    exec(command, (err) => {

        if (err) {
            return res.status(500).json({
                error: "Falha ao baixar"
            });
        }

        res.download(file, () => {
            fs.unlinkSync(file);
        });
    });
});

app.listen(3000, () => {
    console.log("Servidor online");
});