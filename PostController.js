import mysql from 'mysql2';
import { stringify } from "flatted";
import { response } from 'express';
import {json} from "express"

class PostMain {
	
	// При создании объекта на основе этого класса нужно указазать таблицу, с которой будет взаимодействие всего класса.
	constructor (schema_name, sql) {
		this.schema_name = schema_name
		this.output;
		this.sql = sql
	}
	
	// Модель соединения
	connection = mysql.createConnection({
		connectionLimit: 5,
		host:"localhost",
		port: "3306",
		user: "root",
		database: "nodejs_pr_two",
		password: "",
		charset: "UTF8_GENERAL_CI"
	})

	// Фнукция подключения к БД
	connect() {
		this.connection.connect(function(err){
			if(err) {
				return console.error("Ошибка: " + err.message)
			} else {
				console.log("Подключение прошло успешно");
			}
		})
	} 
	// SQL модель запроса для добавления строк
	post_insert(keys, bodys) {
		let ret = null;
		let bodys_after = bodys.map(item => `'${item}'`)
		let bodyall = this.sql.substring((this.sql.indexOf('(') + 1), this.sql.lastIndexOf(')'));
		const body_first = bodyall.split(',')
		const body_arr = body_first.map(element => element.replaceAll(/[\n\t]/gi, '')); 
		
		// Схема поумолчанию
		ret = 	`INSERT INTO ${this.schema_name}(${keys.join(', ')}) VALUES(${bodys_after.join(', ')})`;
		console.log(ret);

		// Оюработчик ошибок, сравнивает данные из SQL схемы и вводимые в POST ключи.
		body_arr.forEach(element => {
				if(element.includes('NOT NULL')) {
					let el = element.split(' ')
					let i = 0;
						keys.forEach(key => {
							if(el[0] !== key) {
								if(i == (keys.length - 1)) {
									// console.log('Не нашел тут ' + el[0] + ' по индексу ' + i + ' ' + keys[i]);
									ret = `Отсуствует необходимый ключ: '${el[0]}', либо файл имеет не правильный формат`; 

								} 

								

							} else {
								// console.log('Нашел тут ' + key + ' по индексу ' + i)
								return
							}
							i += 1;
							}
						)
				}
			}
		)
		return ret
	}	
	
	// Схема создания таблицы поумолчанию
	post(schema_name) {
		return `create table if not exists ${schema_name}(
		Id INT AUTO_INCREMENT PRIMARY KEY,
		author varchar(255) NOT NULL,
		title varchar(255) NOT NULL,
		content varchar(255) NOT NULL,
		picture varchar(255)
	)`;
	}

	// Создание таблицы
	createSchema(schema_name, sql = this.post(this.schema_name)) {
		this.schema_name = schema_name
		this.connection.query(sql, function(err, res){
			if(err) console.log(err);
			else console.log("Таблица создана");
		})
	}


	// Фунция добавления данных строк
	post_table_w (body, files) {
		const {author, title, content, picture} = body
		return new Promise((resolve, reject) => {
			let keys = []
			let boyds = []
			for (let key in body) {
				if(key !== 'id') {
					keys.push(key)
					boyds.push(body[key])
				}
			}
			if(files) {
				files.forEach(element => {
					keys.push(element[0].fieldname)
					boyds.push(element[0].filename)
				});
			}
			this.connection.query(this.post_insert(keys, boyds), 
					function(err, res){
						
					if(err) {
						reject(err.sql)
						console.log('Ошибка добавления данных: ' + err)
					}
					else {
						resolve({Sql_response: res, body: body, picture: files})
						console.log("Данные добавлены")
					};
				})
		}
		) 
		
	}
	// Функция получчения данных строк из таблицы
	getAll_w(){
		return new Promise((resolve, reject) => {
			this.post_get = this.connection.query(`SELECT * FROM ${this.schema_name}`, function(err, res) {
				if(err) {console.log('Ошибка приполучении пакета ' + err)};
				resolve(res)
				reject(err)
			}
			)
	
		})
	}
	// Функция для получения данных строк по ID
	getOne_w(id){
		return new Promise((resolve, reject) => {
			this.post_get = this.connection.query(
				`SELECT * FROM ${this.schema_name}
				WHERE Id = ${id}
				`
			, function(err, res) {
				if(err) {console.log('Ошибка приполучении пакета ' + err)};
				resolve(res)
				reject(err)
			}
			)
	
		})
	}
	// Функция обновления (перезаписи) строки по ID
	update_w(body, files){
		const {id} = body
		return  new Promise((resolve, reject) => {
			let sql = [];
			if(!id) {
				reject('Отсуствует ID')
			} 
			if(id) {
				resolve(body)
			}
			for (let key in body) {
				if(key !== `id`) {
					sql.push(`UPDATE ${this.schema_name} SET ${key} = '${body[key]}' WHERE Id=${id}`) 
				}
			}
			if(files) {
				files.forEach(element => {
					sql.push(`UPDATE ${this.schema_name} SET ${element[0].fieldname} = '${element[0].filename}' WHERE Id=${id}`) 
				});
			}
			sql.forEach(element => {
				this.connection.query(element, (err, res) => {
					// if(err) console.log(err);
					// console.log(res);
				})
			});
		})
		
		

	}
	// Удаление строки по ID
	delete_w(id){
		return new Promise((resolve, reject) => 
			this.connection.query(
				`DELETE FROM ${this.schema_name} WHERE Id=${id}`, 
				(err, res) => {
					if(err) console.log('Ошибка при удалении: ' + err);
					resolve(res)
					reject(err)
				}

			)
		) 
	}



// Обертки для функций
	post_table(req, res) {
		console.log(req.body);
		let files = [];
		for(let key in req.files) {
			files.push(req.files[key]);
		}
		return this.post_table_w(req.body, files)
		.then(resolve => {
			res.status(200)
			res.json(resolve)
		},
		reject => {
			res.status(400)
			res.json(reject)
		}
		)
		
	}
	getAll(req, res) {
		return this.getAll_w().then(resolve => res.json(JSON.parse(stringify(resolve))))
	} 
	getOne(req, res) {
		const {id} = req.params
		let id_after = id.match(/[0-9]/gi).join('')
		return this.getOne_w(id_after).then(resolve => res.json(JSON.parse(stringify(resolve))));
	}
	update(req, res) {
		let files = [];
		for(let key in req.files) {
			files.push(req.files[key]);
		}
		const {id, author, title, content, picture} = req.body
		return this.update_w(req.body, files).then(response => {
			res.status(200)
			res.json({status: 200, 'Inputs': response, files: files})
		}, 
		reject => {
			res.status(400)
			res.json({status: 400, message: reject})
		}
		)
	}
	delete(req, res) {
		const {id} = req.params
		let id_after = id.match(/[0-9]/gi).join('')
		return this.delete_w(id_after).then(resolve => 
			{res.status(200).json(JSON.parse(stringify(resolve)))}, reject => {res.status(500).json('Выполнено с ошибкой ' + reject)})
	}
}



export default PostMain;