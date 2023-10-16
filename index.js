require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const cors = require('cors');
const port = process.env.PORT || 5000
const app = express()

//middleware:
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.v00ay55.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();

        let CoffeeBase = client.db('CoffeBase').collection('Cup')
        let UsersDB = client.db('CoffeBase').collection('Users')

        app.get('/all', async (req, res) => {
            let cursor = CoffeeBase.find()
            result = await cursor.toArray()
            // console.log(result);
            res.send(result)
        })

        app.get('/all/:id', async (req, res) => {
            let id = req.params.id
            let query = { _id: new ObjectId(id) }
            let result = await CoffeeBase.findOne(query)
            res.send(result);
        })

        app.post('/addCoffee', async (req, res) => {
            let newCoffee = req.body
            // console.log(newCoffee);
            let result = await CoffeeBase.insertOne(newCoffee)
            res.send(result)
        })

        app.put('/update/:id', async (req, res) => {
            let id = req.params.id;
            let coffee = req.body
            // console.log(coffee, id);
            let filter = { _id: new ObjectId(id) }
            let option = { upsert: true }
            let updatedCoffee = {
                $set: {
                    coffeeName: coffee.coffeeName,
                    catagory: coffee.catagory,
                    supplier: coffee.supplier,
                    quantity: coffee.quantity,
                    taste: coffee.taste,
                    details: coffee.details,
                    url: coffee.url
                }
            }
            let result = await CoffeeBase.updateOne(filter, updatedCoffee, option);
            res.send(result)
        })

        app.delete('/delete/:id', async (req, res) => {
            let id = req.params.id;
            // console.log("You wanna Delete: ",id);
            let query = { _id: new ObjectId(id) }
            let result = await CoffeeBase.deleteOne(query)
            res.send(result)
        })
        // Users Section ------------------------------------------------------------------------------------------------

        app.get('/users', async (req, res) => {
            let filter = UsersDB.find()
            let result = await filter.toArray()
            res.send(result)
        })

        app.post('/users', async (req, res) => {
            let data = req.body
            let result = await UsersDB.insertOne(data)
            res.send(result)

        })

        app.patch('/users/:email', async (req, res) => {
            let email = req.params.email;
            let time = req.body
            let filter = { email: email }
            let updateTime = {
                $set:{
                    lastActive: time.lastActive 
                }
            }
            let result = await UsersDB.updateOne(filter, updateTime)
            res.send(result)
        })

        app.delete('/users/:id', async (req, res) => {
            let id = req.params.id;
            let filter = { _id: new ObjectId(id) }
            let result = await UsersDB.deleteOne(filter)
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);






app.get('/', (req, res) => {
    res.send('Server Rinning')
})


app.listen(port, () => {
    console.log('Server running at:', port);
})