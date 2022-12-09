import {json, Router} from 'express'
import PostController from './PostController.js'
import multer from 'multer'
import routerMain from './RouterMain.js'

const routerAudio = new Router()


// Схема таблицы
const schema_name = 'audio'
const sql = `create table if not exists ${schema_name}(
	Id INT AUTO_INCREMENT PRIMARY KEY,
	name varchar(255) NOT NULL,
	description varchar(255),
	title varchar(255) NOT NULL,
	delay varchar(255)
)`


// Фильтр медиа
const fields = [
	{name : 'name'}
]
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'upload/audio')
	},
	filename: (req, file, cb) => {
		cb(null, file.originalname + '-' + Date.now())
	}
})
const filter = (req, file, cb) => {
	if(file.mimetype === "audio/mp4" || 
	file.mimetype === "audio/mpeg" || 
	file.mimetype === "audio/aac" || 
	file.mimetype === "audio/ogg") {
		cb(null, true)
	} else {
		cb(`Требуется mp4/mpeg/aac/ogg.` + " Ваш формат: " + file.mimetype)
	}
}
const upload = multer({storage: storage, limits: {fileSize: 5242880}, fileFilter: filter})

const post_main = new PostController(schema_name, sql);
post_main.createSchema(schema_name, sql)



// Пост методы

// Доабление строк
routerAudio.post('/audio', upload.fields(fields), (req, res) => post_main.post_table(req, res))

// Получение всех строк из таблицы
routerAudio.get('/audioAll', (req, res) => post_main.getAll(req, res))

// Получение строки по ID
routerAudio.get('/audio/:id', (req, res) => post_main.getOne(req, res))

// Перезапись строки с конкретным ID (ID обязателен)
routerAudio.put('/audio', upload.fields(fields), (req, res) => post_main.update(req, res))

// Удаление строки с конкретным ID (ID обязателен)
routerAudio.delete('/audio/:id', (req, res) => post_main.delete(req, res))



export default routerAudio