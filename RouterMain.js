import { json, Router } from "express";
import PostController from "./PostController.js";
import multer from "multer";

const routerMain = new Router()

// Схема таблицы, имя указывать отдельно( переиспользуется )
const schema_name = 'post'
const sql = `create table if not exists ${schema_name}(
	Id INT AUTO_INCREMENT PRIMARY KEY,
	author varchar(255) NOT NULL,
	title varchar(255),
	pictures varchar(255),					
	pic varchar(255) NOT NULL
)`


// Фильтр медиа
const fields = [
	{name : 'pictures'},
	{name: 'pic'}
]
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'upload/img')
	},
	filename: (req, file, cb) => {
		cb(null, file.originalname + '-' + Date.now())
	}
})
const filter = (req, file, cb) => {
	if(file.mimetype === "image/png" || 
	file.mimetype === "image/jpeg" || 
	file.mimetype === "image/jpg") {
		cb(null, true)
	} else {
		cb(`Требуется PNG/JPEG/JPG.` + " Ваш формат: " + file.mimetype)
	}
}
const upload = multer({storage: storage, limits: {fileSize: 5242880}, fileFilter: filter})


// Объект контроллера, создание таблицы
const post_main = new PostController(schema_name, sql);
post_main.createSchema(schema_name, sql)






// Доабление строк
routerMain.post('/posts', upload.fields(fields), (req, res) => post_main.post_table(req, res))

// Получение всех строк из таблицы
routerMain.get('/postsAll', (req, res) => post_main.getAll(req, res))

// Получение строки по ID
routerMain.get('/posts/:id', (req, res) => post_main.getOne(req, res))

// Перезапись строки с конкретным ID (ID обязателен)
routerMain.put('/posts', upload.fields(fields), (req, res) => post_main.update(req, res))

// Удаление строки с конкретным ID (ID обязателен)
routerMain.delete('/posts/:id', (req, res) => post_main.delete(req, res))



export default routerMain