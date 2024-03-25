const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const cron = require("node-cron");
const {
	table
} = require("console");

//sql語法搜尋 api
router.post("/:path/sql-search", (req, res) => {
	const {
		sqlQuery
	} = req.body;
	const tableName = req.params.path;

	// 使用傳入的 SQL 查询语句
	const selectQuery = `SELECT * FROM ${tableName} WHERE ${sqlQuery}`;

	const connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '',
		database: 'mmogame',
		port: 3306,
	});

	connection.connect((err) => {
		if (err) {
			console.error('MySQL 連線失敗：', err);
			res.status(500).json({
				error: 'Internal Server Error'
			});
			return;
		}

		console.log('成功連接到 MySQL 伺服器 - SQL 搜尋動作');

		connection.query(selectQuery, (error, results, fields) => {
			if (error) {
				console.error('查詢數據庫失敗：', error);
				res.status(500).json({
					error: 'Internal Server Error'
				});
			} else {
				res.json(results);
			}

			connection.end();
		});
	});
});


//初始化 api
router.get("/:path/search", (req, res) => {
	const tableName = req.params.path;
	
	const selectQuery = `SELECT * FROM ${tableName}`;

	const connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '',
		database: 'mmogame',
		port: 3306,
	});

	connection.connect((err) => {
		if (err) {
			console.error('MySQL 連線失敗：', err);
			res.status(500).json({
				error: 'Internal Server Error'
			});
			return;
		}

		console.log('成功連接到 MySQL 伺服器 - 搜尋動作');

		connection.query(selectQuery, (error, results, fields) => {
			if (error) {
				console.error('查詢數據庫失敗：', error);
				res.status(500).json({
					error: 'Internal Server Error'
				});
			} else {
				res.json(results);
			}

			connection.end();
		});
	});
});

//刪除特定(個)數據 api
router.delete("/:path/delete/:id", (req, res) => {
	const tableName = req.params.path;

	const deleteQuery = `DELETE FROM ${tableName} WHERE id = ?`;

	const connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '',
		database: 'mmogame',
		port: 3306,
	});

	connection.connect((err) => {
		if (err) {
			console.error('MySQL 連線失敗：', err);
			res.status(500).json({
				error: 'Internal Server Error'
			});
			return;
		}

		console.log('成功連接到 MySQL 伺服器 - 刪除動作');

		const idToDelete = req.params.id;

		connection.query(deleteQuery, [idToDelete], (error, results, fields) => {
			if (error) {
				console.error('刪除數據庫失敗：', error);
				res.status(500).json({
					error: 'Internal Server Error'
				});
			} else {
				res.json({
					success: true
				});
			}

			connection.end();
		});
	});
});

//修改特定(個)數據 api
router.put("/:path/modify/:id", (req, res) => {
	const tableName = req.params.path;

	const connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '',
		database: 'mmogame',
		port: 3306,
	});

	connection.connect((err) => {
		if (err) {
			console.error('MySQL 連線失敗：', err);
			res.status(500).json({
				error: 'Internal Server Error'
			});
			return;
		}

		console.log('成功連接到 MySQL 伺服器 - 修改動作');

		const idToModify = req.params.id;
		const updateData = req.body;

		// 動態生成 SQL SET 子句
		const setClause = Object.keys(updateData).map(field => `\`${field}\` = ?`).join(', ');

		connection.query(
			`UPDATE ${tableName} SET ${setClause} WHERE id = ?`,
			[...Object.values(updateData), idToModify],
			(error, results, fields) => {
				if (error) {
					console.error('修改數據庫失敗：', error);
					res.status(500).json({
						error: 'Internal Server Error'
					});
				} else {
					res.json({
						success: true
					});
				}

				connection.end();
			}
		);
	});
});



////刪除搜索(全or頁)數據 api
router.post("/:path/delete-all", (req, res) => {
	const tableName = req.params.path;

	const connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '',
		database: 'mmogame',
		port: 3306,
	});

	connection.connect((err) => {
		if (err) {
			console.error('MySQL 連線失敗：', err);
			res.status(500).json({
				error: 'Internal Server Error'
			});
			return;
		}

		console.log('成功連接到 MySQL 伺服器 - 一併刪除動作');

		const idsToDelete = req.body.ids;

		const deleteAllQuery =
			`DELETE FROM ${tableName} WHERE id IN (${idsToDelete.map(() => '?').join(', ')})`;

		connection.query(deleteAllQuery, idsToDelete, (error, results, fields) => {
			if (error) {
				console.error('一併刪除數據庫失敗：', error);
				res.status(500).json({
					error: 'Internal Server Error'
				});
			} else {
				res.json({
					success: true
				});
			}

			connection.end();
		});
	});
});

//修改搜索(全)數據 api
router.post("/:path/modify-all", (req, res) => {
	const tableName = req.params.path;

	const connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '',
		database: 'mmogame',
		port: 3306,
	});

	connection.connect((err) => {
		if (err) {
			console.error('MySQL 連線失敗：', err);
			res.status(500).json({
				error: 'Internal Server Error'
			});
			return;
		}

		console.log('成功連接到 MySQL 伺服器 - 一併修改動作');

		const {
			ids,
			field,
			value
		} = req.body;

		const modifyAllQuery =
			`UPDATE ${tableName} SET ${field} = ? WHERE id IN (${ids.map(() => '?').join(', ')})`;

		const params = [value, ...ids];

		connection.query(modifyAllQuery, params, (error, results, fields) => {
			if (error) {
				console.error('一併修改數據庫失敗：', error);
				res.status(500).json({
					error: 'Internal Server Error'
				});
			} else {
				res.json({
					success: true
				});
			}

			connection.end();
		});
	});
});

//被動導出TXT api
router.get("/:path/export-txt", async (req, res) => {
	const tableName = req.params.path;

	const selectQuery = `SELECT * FROM ${tableName}`;

	const connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '',
		database: 'mmogame',
		port: 3306,
	});

	connection.connect((err) => {
		if (err) {
			console.error('MySQL 連線失敗：', err);
			res.status(500).json({
				error: 'Internal Server Error'
			});
			return;
		}

		console.log('成功連接到 MySQL 伺服器 - 導出 TXT 動作');

		connection.query(selectQuery, async (error, results, fields) => {
			if (error) {
				console.error('查詢數據庫失敗：', error);
				res.status(500).json({
					error: 'Internal Server Error'
				});
			} else {
				try {
					// 轉換每條數據為字符串，並在之間插入換行符號
					const headers = Object.keys(results[0]).join('\t');
					const txtContent = [headers, ...results.map(row => Object.values(
						row).join('\t'))].join('\n');

					// 確保 TXT 資料夾存在，如果不存在則創建
					const txtFolder = path.join(__dirname, 'TXT');
					if (!fs.existsSync(txtFolder)) {
						fs.mkdirSync(txtFolder);
					}

					// 將轉換後的字符串寫入 TXT 文件
					const fileName = `${tableName}_${Date.now()}.txt`;
					const filePath = path.join(txtFolder, fileName);
					fs.writeFileSync(filePath, txtContent);

					console.log('TXT 文件導出成功');
					// 返回 TXT 文件的下載連結
					res.download(filePath, fileName, (err) => {
						// 刪除服務器上的臨時文件
						if (err) {
							console.error('下載文件時發生錯誤：', err);
						} else {
							// 刪除服務器上的文件
							fs.unlink(filePath, (err) => {
								if (err) {
									console.error('刪除文件時發生錯誤：', err);
								}
							});
						}
					});
				} catch (err) {
					console.error('導出TXT時發生錯誤：', err);
					res.status(500).json({
						error: 'Internal Server Error'
					});
				}
			}

			connection.end();
		});
	});
});


// 設定定時任務，每天 分鐘 小時 執行一次
const tableNames = ['accounts', 'characters', 'donate'];
cron.schedule('25 14 * * *', () => {
	console.log('自動導出 TXT 開始...');
	tableNames.forEach(tableName => {
		autoexportTxt(tableName);
	});
}, {
	scheduled: true,
	timezone: "Asia/Taipei" // 設定時區
});

//自動化導出TXT api
function autoexportTxt(tableName) {
	console.log(`開始導出表格 ${tableName}`);

	const selectQuery = `SELECT * FROM ${tableName}`;

	const connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '',
		database: 'mmogame',
		port: 3306,
	});

	connection.connect((err) => {
		if (err) {
			console.error('MySQL 連線失敗：', err);
			return;
		}

		console.log('成功連接到 MySQL 伺服器 - 導出 TXT 動作');

		connection.query(selectQuery, async (error, results, fields) => {
			if (error) {
				console.error('查詢數據庫失敗：', error);
			} else {
				try {
					// 轉換每條數據為字符串，並在之間插入換行符號
					const headers = Object.keys(results[0]).join('\t');
					const txtContent = [headers, ...results.map(row => Object.values(row).join(
						'\t'))].join('\n');

					// 确保 TXT 文件夹存在，如果不存在則創建
					const txtFolder = path.join(__dirname, 'TXT');
					if (!fs.existsSync(txtFolder)) {
						fs.mkdirSync(txtFolder);
					}

					// 將轉換後的字符串寫入 TXT 文件
					const fileName = `${tableName}_${getCurrentDate()}.txt`;
					const filePath = path.join(txtFolder, fileName);
					fs.writeFileSync(filePath, txtContent);

					console.log('TXT 文件導出成功');
				} catch (err) {
					console.error('導出TXT時發生錯誤：', err);
				}
			}

			connection.end();
		});
	});
}


function getCurrentDate() {
	const now = new Date();
	const year = now.getFullYear();
	const month = (now.getMonth() + 1).toString().padStart(2, '0');
	const day = now.getDate().toString().padStart(2, '0');
	return `${year}${month}${day}`;
}


router.get("/:path/export-txt-search-keyword", async (req, res) => {
	const tableName = req.params.path;

	// 獲取搜索條件
	const {
		searchField,
		keyword
	} = req.query;

	// 初始化基本的 SQL 查询语句
	let searchQuery = `SELECT * FROM ${tableName} WHERE 1`;

	if (keyword) {
		// 判斷關鍵字是否為數字
		if (!isNaN(keyword)) {
			searchQuery += ` AND ${searchField} = ${keyword}`; // 如果是數字，使用相等判斷
		} else {
			searchQuery += ` AND ${searchField} LIKE '%${keyword}%'`; // 如果不是數字，使用 LIKE
		}
	}

	console.log('SQL Query:', searchQuery);

	const connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '',
		database: 'mmogame',
		port: 3306,
	});

	connection.connect((err) => {
		if (err) {
			console.error('MySQL 連線失敗：', err);
			res.status(500).json({
				error: 'Internal Server Error'
			});
			return;
		}

		console.log('成功連接到 MySQL 伺服器 - 導出 TXT (搜索) 動作');

		connection.query(searchQuery, async (error, results, fields) => {
			if (error) {
				console.error('查詢數據庫失敗：', error);
				res.status(500).json({
					error: 'Internal Server Error'
				});
			} else {
				try {
					if (keyword) {
						// 轉換每條數據為字符串，並在之間插入換行符號
						const headers = Object.keys(results[0]).join('\t');
						const txtContent = [headers, ...results.map(row => Object
							.values(row).join('\t'))].join('\n');

						const txtFolder = path.join(__dirname, 'TXT');
						if (!fs.existsSync(txtFolder)) {
							fs.mkdirSync(txtFolder);
						}

						// 將轉換後的字符串寫入 TXT 文件
						const fileName = `${tableName}_search_${Date.now()}.txt`;
						const filePath = path.join(txtFolder, fileName);
						fs.writeFileSync(filePath, txtContent);

						console.log('TXT 文件導出成功 (搜索)');
						// 返回 TXT 文件的下載連結
						res.download(filePath, fileName, (err) => {
							// 刪除服務器上的臨時文件
							if (err) {
								console.error('下載文件時發生錯誤：', err);
							} else {
								// 刪除服務器上的文件
								fs.unlink(filePath, (err) => {
									if (err) {
										console.error('刪除文件時發生錯誤：',
											err);
									}
								});
							}
						});
					} else {
						console.log('沒有關鍵字，不導出數據');
						res.status(400).json({
							error: 'No keyword provided for export'
						});
					}
				} catch (err) {
					console.error('導出TXT (搜索) 時發生錯誤：', err);
					res.status(500).json({
						error: 'Internal Server Error'
					});
				}
			}

			connection.end();
		});
	});
});


router.get("/:path/export-txt-search-time", async (req, res) => {

	const tableName = req.params.path;

	// 獲取搜索條件
	const {
		timeField,
		startTime,
		endTime
	} = req.query;

	// 初始化基本的 SQL 查询语句
	let searchQuery = `SELECT * FROM ${tableName} WHERE 1`;

	console.log(req.query.searchField)

	if (req.query.startTime && req.query.endTime) {
		const start = req.query.startTime;
		const end = req.query.endTime;
		searchQuery += ` AND ${req.query.timeField} BETWEEN '${start}' AND '${end}'`;
	}

	const searchTitle = req.query.timeField;

	console.log('SQL Query:', searchQuery);

	const connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '',
		database: 'mmogame',
		port: 3306,
	});

	connection.connect((err) => {
		if (err) {
			console.error('MySQL 連線失敗：', err);
			res.status(500).json({
				error: 'Internal Server Error'
			});
			return;
		}

		connection.query(searchQuery, async (error, results, fields) => {
			if (error) {
				console.error('查詢數據庫失敗：', error);
				res.status(500).json({
					error: 'Internal Server Error'
				});
			} else {
				try {
					if (startTime && endTime) {
						let filteredResults = results;

						if (startTime && endTime) {
							const start = new Date(startTime);
							const end = new Date(endTime);
							filteredResults = filteredResults.filter(row => {
								console.log(searchTitle);
								const createdAt = new Date(row[searchTitle]);
								return createdAt >= start && createdAt <= end;
							});
						}

						// 轉換每條數據為字符串，並在之間插入換行符號
						const headers = Object.keys(filteredResults[0]).join('\t');
						const txtContent = [headers, ...filteredResults.map(row =>
							Object
							.values(row).join('\t'))].join('\n');

						const txtFolder = path.join(__dirname, 'TXT');
						if (!fs.existsSync(txtFolder)) {
							fs.mkdirSync(txtFolder);
						}

						// 將轉換後的字符串寫入 TXT 文件
						const fileName = `${tableName}_search_${Date.now()}.txt`;
						const filePath = path.join(txtFolder, fileName);
						fs.writeFileSync(filePath, txtContent);

						console.log('TXT 文件導出成功 (搜索)');
						// 返回 TXT 文件的下載連結
						res.download(filePath, fileName, (err) => {
							// 刪除服務器上的臨時文件
							if (err) {
								console.error('下載文件時發生錯誤：', err);
							} else {
								// 刪除服務器上的文件
								fs.unlink(filePath, (err) => {
									if (err) {
										console.error('刪除文件時發生錯誤：',
											err);
									}
								});
							}
						});
					} else {
						console.log('沒有關鍵字，不導出數據');
						res.status(400).json({
							error: 'No keyword or time range provided for export'
						});
					}

				} catch (err) {
					console.error('導出TXT (搜索) 時發生錯誤：', err);
					res.status(500).json({
						error: 'Internal Server Error'
					});
				}
			}

			connection.end();
		});
	});
});

router.get("/:path/export-txt-search-both", async (req, res) => {
	const tableName = req.params.path;

	// 獲取搜索條件
	const {
		keyword,
		searchField,
		timeField,
		startTime,
		endTime
	} = req.query;

	// 初始化基本的 SQL 查询语句
	let searchQuery = `SELECT * FROM ${tableName} WHERE 1`;

	if (keyword) {
		// 判斷關鍵字是否為數字
		if (!isNaN(keyword)) {
			searchQuery += ` AND ${searchField} = ${keyword}`; // 如果是數字，使用相等判斷
		} else {
			searchQuery += ` AND ${searchField} LIKE '%${keyword}%'`; // 如果不是數字，使用 LIKE
		}
	}


	console.log(req.query.searchField)

	if (req.query.startTime && req.query.endTime) {
		const start = req.query.startTime;
		const end = req.query.endTime;
		searchQuery += ` AND ${req.query.timeField} BETWEEN '${start}' AND '${end}'`;
	}

	const searchTitle = req.query.timeField;

	console.log('SQL Query:', searchQuery);

	const connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '',
		database: 'mmogame',
		port: 3306,
	});

	connection.connect((err) => {
		if (err) {
			console.error('MySQL 連線失敗：', err);
			res.status(500).json({
				error: 'Internal Server Error'
			});
			return;
		}

		connection.query(searchQuery, async (error, results, fields) => {
			if (error) {
				console.error('查詢數據庫失敗：', error);
				res.status(500).json({
					error: 'Internal Server Error'
				});
			} else {
				try {
					if (startTime && endTime) {
						let filteredResults = results;

						if (startTime && endTime) {
							const start = new Date(startTime);
							const end = new Date(endTime);
							filteredResults = filteredResults.filter(row => {
								console.log(searchTitle);
								const createdAt = new Date(row[searchTitle]);
								return createdAt >= start && createdAt <= end;
							});
						}

						// 轉換每條數據為字符串，並在之間插入換行符號
						const headers = Object.keys(filteredResults[0]).join('\t');
						const txtContent = [headers, ...filteredResults.map(row =>
							Object
							.values(row).join('\t'))].join('\n');

						const txtFolder = path.join(__dirname, 'TXT');
						if (!fs.existsSync(txtFolder)) {
							fs.mkdirSync(txtFolder);
						}

						// 將轉換後的字符串寫入 TXT 文件
						const fileName = `${tableName}_search_${Date.now()}.txt`;
						const filePath = path.join(txtFolder, fileName);
						fs.writeFileSync(filePath, txtContent);

						console.log('TXT 文件導出成功 (搜索)');
						// 返回 TXT 文件的下載連結
						res.download(filePath, fileName, (err) => {
							// 刪除服務器上的臨時文件
							if (err) {
								console.error('下載文件時發生錯誤：', err);
							} else {
								// 刪除服務器上的文件
								fs.unlink(filePath, (err) => {
									if (err) {
										console.error('刪除文件時發生錯誤：',
											err);
									}
								});
							}
						});
					} else {
						console.log('沒有關鍵字，不導出數據');
						res.status(400).json({
							error: 'No keyword or time range provided for export'
						});
					}

				} catch (err) {
					console.error('導出TXT (搜索) 時發生錯誤：', err);
					res.status(500).json({
						error: 'Internal Server Error'
					});
				}
			}

			connection.end();
		});
	});
});


router.post("/:path/add", (req, res) => {
	const tableName = req.params.path;

	const addFormData = req.body;

	const connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '',
		database: 'mmogame',
		port: 3306,
	});

	connection.connect((err) => {
		if (err) {
			console.error('MySQL 連線失敗：', err);
			res.status(500).json({
				error: 'Internal Server Error'
			});
			return;
		}

		console.log('成功連接到 MySQL 伺服器 - SQL 搜尋動作');

		connection.query(`INSERT INTO ${tableName} SET ?`, addFormData, (error, results, fields) => {
			if (error) {
				console.error('查詢數據庫失敗：', error);
				res.status(500).json({
					error: 'Internal Server Error'
				});
			} else {
				res.json(results);
			}

			connection.end();
		});
	});
});




module.exports = router;
