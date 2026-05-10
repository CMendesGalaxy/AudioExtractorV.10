const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Backend online");
});

app.post("/download", async (req, res) => {

    try {

        const url = req.body.url;

        if (!url) {
            return res.status(400).json({
                error: "URL inválida"
            });
        }

        const file = `audio_${Date.now()}.mp3`;

        const command =
            `yt-dlp -x --audio-format mp3 -o "${file}" "${url}"`;

        exec(command, (err, stdout, stderr) => {

            if (err) {

                console.log(stderr);

                return res.status(500).json({
                    error: "Falha ao baixar"
                });
            }

            if (!fs.existsSync(file)) {
                return res.status(500).json({
                    error: "Arquivo não gerado"
                });
            }

            res.download(file, "audio.mp3", () => {

                try {
                    fs.unlinkSync(file);
                } catch {}
            });
        });

    } catch (e) {

        console.log(e);

        res.status(500).json({
            error: "Erro interno"
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor online na porta ${PORT}`);
});
