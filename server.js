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
`python3 -m yt_dlp \
--no-playlist \
-x \
--audio-format mp3 \
-o "${file}" \
"${url}"`;

        console.log("INICIANDO DOWNLOAD...");
        console.log(command);

        exec(command, {
            timeout: 120000,
            maxBuffer: 1024 * 1024 * 20
        }, (err, stdout, stderr) => {

            console.log("STDOUT:");
            console.log(stdout);

            console.log("STDERR:");
            console.log(stderr);

            if (err) {

                console.log("ERRO:");
                console.log(err);

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

                    console.log("Arquivo removido");

                } catch(e) {

                    console.log(e);
                }
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
