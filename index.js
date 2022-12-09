import express from "express";
import PostController from "./PostController.js";
import routerMain from "./RouterMain.js";
import { dirname } from 'path'
import { fileURLToPath } from "url";
import routerAudio from "./routerAudio.js";

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename);


const PORT = 5000;
const app = express();
const urlencodedParser = express.urlencoded({extended: false});

// Подключение к бд
let post_main = new PostController();
post_main.connect();

// Использование json
app.use(express.json())
// Роутеры
app.use('/api', routerMain)
app.use('/api', routerAudio)
app.use(express.static(__dirname));


// Сервер express
app.listen(PORT, () => console.log("SERVER STARTED ON: " + PORT))