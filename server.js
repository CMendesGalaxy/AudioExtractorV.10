const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
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

        console.log("INICIANDO DOWNLOAD...");
        console.log(url);

        const process = spawn("yt-dlp", [
            "--no-playlist",
            "-f", "bestaudio",
            "--extract-audio",
            "--audio-format", "mp3",
            "--no-warnings",
            "--restrict-filenames",
            "-o", file,
            url
        ]);

        process.stdout.on("data", (data) => {

            console.log("STDOUT:");
            console.log(data.toString());
        });

        process.stderr.on("data", (data) => {

            console.log("STDERR:");
            console.log(data.toString());
        });

        process.on("close", (code) => {

            console.log("FINALIZADO:", code);

            if (code !== 0) {

                return res.status(500).json({
                    error: "Falha ao baixar"
                });
            }

            if (!fs.existsSync(file)) {

                return res.status(500).json({
                    error: "Arquivo não gerado"
                });
            }

            console.log("ENVIANDO ARQUIVO...");

            res.download(file, "audio.mp3", () => {

                try {

                    fs.unlinkSync(file);

                    console.log("Arquivo removido");

                } catch(e) {

                    console.log(e);
                }
            });
        });

    } catch (e) {

        console.log("ERRO INTERNO:");
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
