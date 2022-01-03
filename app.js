const express = require('express')
const app = express()
const {MongoClient,ObjectId} = require('mongodb')

const DATABASE_URL = 'mongodb+srv://minhthanh:Mot23456@cluster0.idrck.mongodb.net/test'
const DATABASE_NAME = 'GCH0901_DB'

app.set('view engine', 'hbs')
app.use(express.urlencoded({ extended: true }))


//Index user page
app.get('/',(req,res)=>{
    res.render('index')
})

app.get('/view',async (req,res)=>{

    const dbo = await getDatabase()
    const results = await dbo.collection("Products").find({}).sort({name:1}).limit(7).toArray()
    
    res.render('view',{products:results})
})

// Insert new product
app.get('/insert',(req,res)=>{
    res.render('product')
})

app.post('/product',async (req,res)=>{
    const nameInput = req.body.txtName
    const priceInput = req.body.txtPrice
    const imageInput = req.body.txtImage
    if(isNaN(priceInput)==true){
       
        const errorMessage = "Error!"
        const oldValues = {name:nameInput,price:priceInput,image:imageInput}
        res.render('product',{error:errorMessage,oldValues:oldValues})
        return;
    }
    const newP = {name:nameInput,price:Number.parseFloat(priceInput),image:imageInput}

    const dbo = await getDatabase()
    const result = await dbo.collection("Products").insertOne(newP)
    console.log("Gia tri id moi duoc insert la: ", result.insertedId.toHexString());
    res.redirect('/')
})

// Delete product funtion
app.get('/delete',async (req,res)=>{
    const id = req.query.id
    console.log("id can xoa:"+ id)
    const dbo = await getDatabase()
    await dbo.collection("Products").deleteOne({_id:ObjectId(id)})
    res.redirect('/view')
})

// Search product funtion
app.post('/doSearchProducts', async (req, res) => {
    const inputName = req.body.txtName
    const dbo = await getDatabase()
    const results = await dbo.collection("Products").find({ name: new RegExp(inputName, "i") }).sort({ Name: -1 }).toArray()

    res.render('view', { products: results })
});


// Edit product funtion
app.post('/edit',async (req,res)=>{
    const nameInput = req.body.txtName
    const priceInput = req.body.txtPrice
    const imageInput = req.body.txtImage
    const id = req.body.txtId
    
    const myquery = { _id: ObjectId(id) }
    const newvalues = { $set: {name: nameInput, price: priceInput,image:imageInput } }
    const dbo = await getDatabase()
    await dbo.collection("Products").updateOne(myquery,newvalues)
    res.redirect('/view')
})

app.get('/edit',async (req,res)=>{
    const id = req.query.id
    
    const dbo = await getDatabase()
    const productToEdit = await dbo.collection("Products").findOne({_id:ObjectId(id)})
    res.render('edit',{product:productToEdit})
})

async function getDatabase() {
    const client = await MongoClient.connect(DATABASE_URL)
    const dbo = client.db(DATABASE_NAME)
    return dbo
}

const PORT = process.env.PORT || 5000
app.listen(PORT)
console.log('Server is running!')