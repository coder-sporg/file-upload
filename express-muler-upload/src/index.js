const express = require("express");
const multer = require("multer");
const cors = require("cors");

const { MulterError } = require('multer');

const fs = require('fs');
const path = require('path')

const app = express();
app.use(cors());

/**
 * __dirname 表示当前文件所在的目录 xxx/src
 * process.cwd() 表示当前进程的工作目录 xxx
 */

// const upload = multer({ dest: "uploads/" });

// 指定文件存储路径: multer.diskStorage 是磁盘存储，通过 destination、filename 的参数分别指定保存的目录和文件名
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        try {
            fs.mkdirSync(path.join(process.cwd(), 'uploads'))
        } catch (e) {
            cb(null, path.join(process.cwd(), 'uploads'))
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + '-' + file.originalname
        // console.log('uniqueSuffix', uniqueSuffix)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

const upload = multer({ storage })

app.get("/", function (req, res, next) {
  res.send("Hello World!");
});

// 单个文件上传
app.post("/upload-single", upload.single("file"), function (req, res, next) {
  console.log("req.file", req.file);
  console.log("req.body", req.body);
  res.send("success");
});

// 两个文件上传
app.post("/upload-two", upload.array("file", 2), function (req, res, next) {
  console.log("req.files", req.files);
  console.log("req.body", req.body);
  res.send("success");
}, function(err, req, res, next) {
    // 超出文件上传数量抛错
    if(err instanceof MulterError && err.code === 'LIMIT_UNEXPECTED_FILE') {
        res.status(400).end('Too many files uploaded');
    }
});

// 多个字段都会上传文件，限制不同
// 通过 fields 方法指定每个字段的名字和最大数量，然后接收到请求后通过 req.files['xxx'] 来取对应的文件信息
app.post("/upload-multiple", upload.fields([{ name: 'file1', maxCount: 2 }, { name: 'file2', maxCount: 2 }]), function (req, res, next) {
    console.log("req.files", req.files);
    console.log("req.body", req.body);
    res.send("success");
})

// 任意文件上传
app.post("/upload-any", upload.any(), function (req, res, next) {
    console.log("req.files", req.files);
    console.log("req.body", req.body);
    res.send("success");
})

app.listen(3333);
