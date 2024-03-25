const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const jwt = require('jsonwebtoken');
const passport = require("passport");
const bcrypt = require("bcrypt");
const requestIp = require('request-ip');

// SQL 語法與變數 (account)
const selectEmailQuery = 'SELECT * FROM account WHERE email = ?';
const insertEmailQuery = 'INSERT INTO account (name, email, password, createdate, IP) VALUES (?, ?, ?, ?, ?)';


//$route POST api/users/register
//@desc return post json
//@access public
router.post("/register", (req, res) => {
	const {
		name,
		email,
		password
	} = req.body;
	const clientIP = req.clientIp;

	//    console.log(req.body);
	
	const connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '',
		database: 'web',
		port: 3306,
	});

	// 在這裡打開連接
	connection.connect((err) => {
		if (err) {
			console.error('MySQL 連線失敗：', err);
			res.status(500).json({
				error: 'Internal Server Error'
			});
			return;
		}

		console.log('成功連接到 MySQL 伺服器 - 註冊動作');

		// 執行查詢
		connection.query(selectEmailQuery, [email], (error, results, fields) => {
			if (error) {
				console.error('查詢數據庫失敗：', error);
				res.status(500).json({
					error: 'Internal Server Error'
				});
			} else {
				// 檢查查詢結果是否包含用戶
				if (results.length > 0) {
					// 用戶名已存在，返回錯誤信息
					res.status(400).json({
						error: '電子郵件已存在'
					});
				} else {
					console.log(req.body); //檢查是否正確獲取(中間件)
					bcrypt.genSalt(10, function(err, salt) {
						bcrypt.hash(password, salt, (err, hash) => {
							if (err) throw err;

							const encryptedPassword = hash;
							const currentDate = new Date(); // 取得當前日期和時間

							// 插入數據
							connection.query(insertEmailQuery, [name, email,
								encryptedPassword, currentDate, clientIP
							], (error, results, fields) => {
								if (error) {
									console.error('插入數據庫失敗：', error);
									res.status(500).json({
										error: 'Internal Server Error'
									});
								} else {
									// 插入成功
									res.json({
										success: true
									});
								}

								// 關閉 MySQL 連接
								connection.end();
							});
						});
					});
				}
			}
		});
	});
});

//$route POST api/users/login
//@desc return token jwt passport
//@access public

router.post("/login", (req, res) => {
	const {
		email,
		password
	} = req.body;

	// 獲取請求的IP
	const clientIP = req.clientIp;

	// 預期的 IP 地址（替換為要允許 IP 地址）
	const expectedIPs = ["127.0.0.1"];

	if (!expectedIPs.includes(clientIP)) {
		return res.status(404).json({
			message: '嘿嘿 見鬼啦 !'
		});
	}
	
	const connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '',
		database: 'web',
		port: 3306,
	});

	// 在這裡打開連接
	connection.connect((err) => {
		if (err) {
			console.error('MySQL 連線失敗：', err);
			res.status(500).json({
				error: 'Internal Server Error'
			});
			return;
		}

		console.log('成功連接到 MySQL 伺服器 - 登入動作');

		// 執行查詢
		connection.query(selectEmailQuery, [email], (error, results, fields) => {
			if (error) {
				console.error('查詢數據庫失敗：', error);
				res.status(500).json({
					error: 'Internal Server Error'
				});
			} else {
				// 檢查查詢結果是否包含用戶
				if (results.length == 1) {
					const user = results[0];
					//密碼判定
					bcrypt.compare(password, user.password)
						.then(isMatch => {
							if (isMatch) {
								const expiresIn = 7200; //token過期時間 3600為一小時
								const rule = {
									id: user.id,
									name: user.name
								};
								jwt.sign(rule, "secret", {
									expiresIn
								}, (err, token) => {
									if (err) throw err;
									res.json({
										success: true,
										token: "Bearer " + token,
										expiresIn,
									})
								})
							} else {
								return res.status(400).json({
									message: "密碼錯誤"
								});
							}
						})
				} else {
					res.status(404).json({
						message: '找不到用戶'
					});
				}
				connection.end();
			}
		})
	})
})

//$route POST api/users/current
//@desc return current user
//@access private
router.get("/current", passport.authenticate("jwt", {
	session: false
}), (req, res) => {
	res.json(req.user);
})

module.exports = router;