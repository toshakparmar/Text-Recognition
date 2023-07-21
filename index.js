const express = require('express')

const multer = require('multer')

const tesseract = require("node-tesseract-ocr")

const path = require('path')

const app = express()

app.use(express.static(path.join(__dirname + '/uploads/')))
app.use(express.static(path.join(__dirname + '/captures/')))
app.use(express.static(path.join(__dirname + '/css/')))

app.set('view engine', "ejs")

const storage1 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + "-" +Date.now() +path.extname(file.originalname)
        );
    },
})
const storage2 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "captures");
    },
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + "-" +Date.now() +path.extname(file.originalname)
        );
    },
})

const upload = multer({storage:storage1})
const capture = multer({storage:storage2})

app.get('/', (req, res) => {

    res.render('upload_image',{data:'', imagename:'', success:'', error:''})
})

app.get('/capture-image', (req, res) => {

    res.render('open_camera',{data2:'', success2:'', error2:''})
})

app.post('/recognize-text-uploaded-image', upload.single('file'),(req,res) => {
    console.log(req.file)

    var imagename = req.file.filename;

    const config = {
        lang: "eng",
        oem: 1,
        psm: 3,
      }
      
      tesseract
        .recognize(req.file.path, config)
        .then((text) => {
          console.log("Result:", text)
        
          res.render('upload_image',{data:text, imagename:imagename , success:'File Uploaded & Recognized Text Successfully...', error:''})

        })
        .catch((error) => {
          console.log(error.message)
          res.render('upload_image',{data:'', imagename:'', success:'', error:'File did not Upload & & Recognize Text Successfully! Please try again...'})
        })
})

app.post('/recognize-text-captured-image', capture.single('captured_image'),(req,res) => {
    console.log(req.file.path)

    const config = {
        lang: "eng",
        oem: 1,
        psm: 3,
      }
      
      tesseract
        .recognize(req.file.path, config)
        .then((text) => {
          console.log("Result:", text)
          if(text != ''){
            res.render('open_camera',{data2:text, success2:'Captured Image Recognized Text Successfully...', error2:''})
          }else{
            res.render('open_camera',{data2:'', success2:'', error2:'Captured Image did not Recognize Text Successfully! Please try again...'})
          }
        })
        .catch((error) => {
          console.log(error.message)
          res.render('open_camera',{data2:'', success2:'', error2:'Captured Image did not Recognize Text Successfully! Please try again...'})
        })
})

app.listen(5000, () =>  {
    console.log("App is Running on Port 5000")
})