require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// Adds headers: Access-Control-Allow-Origin: *
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xhm3y2q.mongodb.net/?appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
  
    await client.connect();

    // Connect to the "wanderlust" database and access its "destination" collection
    const db = client.db("wanderlust");
    const destinationsCollection = db.collection("destination");
    const bookingCollection = db.collection("booking");

   // GET method route all data
    app.get('/destinations', async(req, res) =>{
      const result = await destinationsCollection.find().toArray();
    res.send( result,'GET request to the homepage');
    });

    // single data
   app.get('/destinations/:id', async (req, res) => {
    const { id } = req.params;
    const result = await destinationsCollection.findOne({ _id:id});

    if (!result) {
        return res.status(404).send({ message: "Destination not found" });
    }

    res.send(result);
});

    // Update  single data 
   app.patch('/destinations/:id', async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;
    const result = await destinationsCollection.updateOne(
      { _id:id},
      {$set:updatedData},
    );
    if (!result) {
        return res.status(404).send({ message: "Destination not found" });
    }

    res.send(result);
});

 // single data
   app.delete('/destinations/:id', async (req, res) => {
    const { id } = req.params;
    const result = await destinationsCollection.deleteOne({ _id:id});

    if (!result) {
        return res.status(404).send({ message: "Destination not found" });
    }

    res.send(result);
});

 // POST method route for booking
    app.post("/booking", async(req, res) => {
      const newBooking = req.body;
      console.log(newBooking);
      const result = await bookingCollection.insertOne(newBooking);
      res.send(result);
    });




    // POST method route
    app.post("/destination", async(req, res) => {
      const newDestinations = req.body;
      console.log(newDestinations);
      const result = await destinationsCollection.insertOne(newDestinations);
      res.send(result);
    });


    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
