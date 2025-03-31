const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const multer  = require('multer')
const mongoose = require('mongoose')
const path=require('path')

const app = express();
app.use(cors());
app.use(bodyParser.json())

const port = 3000

mongoose.connect("mongodb://localhost:27017/test")

const Users = mongoose.model('Users', {
    username: String,
    password: String
})

const Product = mongoose.model('Products', {
    title: String,
    price: String,
    category: String,
    description: String,
    image:String
})

app.get("/", (req, res) => {
    res.send("hello world!!")
})

app.post('/signup', (req, res) => {
    const username = req.body.email
    const password = req.body.password
    const user = new Users({ username: username, password: password })
    user.save()
        .then(() => {
            res.send({message:'Saved success'})
        })
        .catch(() => {
            res.send({message:'Server error'})
        })
})

app.post('/login', (req, res) => {
    const username = req.body.email
    const password = req.body.password
    
    Users.findOne({ username: username })
        .then(result => {
            if (result) {
                // console.log(result)
                if (result.password == password) {
                    const token = jwt.sign({
                        data:result
                    },'SECKEY',{expiresIn:'1h'})
                    res.send({ message: 'find success!', token: token })
                } else {
                    console.log('wrong!!')
                    res.send('wrong password')
                }
            } else {
                res.send({message:'user not found'})
            }

        })
        .catch(err => {
            res.send({message:'server error'})
        })
})

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + file.originalname
      cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

const upload = multer({ storage: storage })

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.post('/postAd', upload.single('image'), (req, res) => {
    console.log(req.body)
    if (!req.file) {
        console.log("no file uploaded!!")
        return 
    }
    console.log(req.file)
    const title = req.body.title
    const price = req.body.price
    const description = req.body.description
    const category = req.body.category
    const image = req.file.path
    
    const product = new Product({ title, price, description, category, image }) 
    product.save()
        .then(() => {
            res.send({message:'Saved success!!'})
        }).catch(() => {
            res.send({message:'server error'})
        })
})

app.get('/products', (req, res) => {
    Product.find()
        .then((result) => {
            // console.log()
            res.send({products:result})
        }).catch((err) => {
            res.send({message: 'server error'})
        })
})

app.listen(port, () => {
    console.log("listening...")
})