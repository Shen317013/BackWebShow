const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const cron = require("node-cron");
const iconv = require('iconv-lite');
const multer = require('multer');

const uploadDir = 'C:\\Users\\Freeeee\\Desktop\\Web\\node-vue\\uploads';

function clearUploadsDir() {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      console.error('讀取目錄時發生錯誤：', err);
      return;
    }

    files.forEach(file => {
      const filePath = path.join(uploadDir, file);
      fs.unlink(filePath, err => {
        if (err) {
          console.error('刪除文件時發生錯誤：', err);
        } else {
          console.log('成功刪除文件:', filePath);
        }
      });
    });
  });
}

// 每天的凌晨12點執行清理操作 分 時
cron.schedule('0 0 * * *', () => {
  console.log('開始清理uploads...');
  clearUploadsDir();
});

if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // 指定目標路徑
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix); // 使文件名不衝突
  }
});

const upload = multer({
	dest: 'uploads/'
});

router.post('/upload-file', upload.single('file'), (req, res) => {

	// 獲取上傳的文件路徑
	const filePath = req.file.path;
	res.json({
		filePath
	});
});

router.get('/get-file-content', (req, res) => {
    const filePath = req.query.filePath; 

    fs.readFile(filePath, 'utf8', (utfErr, utfData) => {
        if (!utfErr) {
            res.json({
                content: utfData
            });
        } else {
            fs.readFile(filePath, 'binary', (binaryErr, data) => {
                if (binaryErr) {
                    console.error('讀取有誤：', binaryErr);
                    return res.status(500).json({
                        error: 'Internal Server Error'
                    });
                }

               
                const utf8Content = iconv.decode(Buffer.from(data, 'binary'), 'big5');

                res.json({
                    content: utf8Content
                });
            });
        }
    });
});

module.exports = router;
