const express = require("express");
const mysql = require("mysql2");
const app = express();
const bodyParser = require("body-parser");
const passport = require("passport");
const requestIp = require('request-ip');
const users = require("./routes/api/users");
const importlogs = require("./routes/api/importlogs");
const database = require("./routes/api/database");
const port = 5000;

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'web',
  port: 3306,
});

connection.connect((err) => {
  if (err) {
    console.error('MySQL 連線失敗：', err);
  } else {
    console.log('成功連接到 MySQL 伺服器');
  }
});


// 使用 body-parser 中間件
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(requestIp.mw());

app.use(passport.initialize());

require("./passport.js")(passport);

//開啟localhost網頁就會直接作動
app.get('/', (req, res) => {
  // 執行一個簡單的 MySQL 查詢
  connection.query('SELECT * FROM account', (error, results, fields) => {
    if (error) {
      console.error('MySQL 查詢錯誤：', error);
      res.status(500).send('內部伺服器錯誤');
    } else {
      // 將查詢結果回傳給用戶端
      res.json(results);
    }
  });
});

//使用routes
app.use("/api/users", users);
app.use("/api/importlogs", importlogs);
app.use("/api/database", database);


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
})

// 當應用程式結束時，關閉 MySQL 連線
process.on('SIGINT', () => {
  connection.end();
  process.exit();
});