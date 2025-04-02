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
    // Verify JWT token for authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, 'SECKEY');
        // Token is valid, continue with post creation
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
    
    console.log(req.body);
    if (!req.file) {
        return res.status(400).json({ message: 'No image uploaded' });
    }
    
    console.log(req.file);
    const title = req.body.title;
    const price = req.body.price;
    const description = req.body.description;
    const category = req.body.category;
    // Store only the relative path to make retrieval consistent
    const image = '/uploads/' + req.file.filename;
    
    const product = new Product({ title, price, description, category, image });
    product.save()
        .then(() => {
            res.status(201).json({ message: 'Ad posted successfully!', product });
        }).catch((err) => {
            console.error('Error saving product:', err);
            res.status(500).json({ message: 'Server error while saving product' });
        });
})

app.get('/products', (req, res) => {
    Product.find()
        .then((products) => {
            // Format the products to ensure image URLs are properly formed
            const formattedProducts = products.map(product => {
                const productObj = product.toObject();
                // Ensure the image path is properly formatted
                if (productObj.image && !productObj.image.startsWith('http')) {
                    // If it's a relative path, make sure it's properly formatted
                    if (!productObj.image.startsWith('/uploads/') && productObj.image.includes('uploads')) {
                        productObj.image = '/uploads/' + productObj.image.split('uploads/')[1];
                    }
                }
                return productObj;
            });
            
            res.status(200).json({ success: true, products: formattedProducts });
        }).catch((err) => {
            console.error('Error fetching products:', err);
            res.status(500).json({ success: false, message: 'Server error while fetching products' });
        });
})

app.listen(port, () => {
    console.log("listening...")
})