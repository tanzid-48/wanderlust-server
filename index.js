require("dotenv").config();
const express = require("express");
const cors = require("cors");
const {
  MongoClient,
  ServerApiVersion,
  ObjectId,
} = require("mongodb");
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xhm3y2q.mongodb.net/?appName=Cluster0`;

// Mongo Client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
// Middleware

const JWKS = createRemoteJWKSet(
      new URL('https://wanderlust-pvb4.vercel.app/api/auth/jwks')
    );

const verifyToken = async (req, res, next) => {
  
  const authHeader = req.headers.authorization;
 if (!authHeader){
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token =authHeader.split(" ")[1];

if (!token){
    return res.status(401).json({ message: "Unauthorized" });
  }
   try {
    const { payload } = await jwtVerify(token, JWKS)
    console.log(payload);
    next()
    
   } catch (error) {
    return res.status(403).json({ message: "Invalid token" })
   } 

}



async function run() {
  try {
 
    // await client.connect();


    const db = client.db("wanderlust");
    const destinationsCollection = db.collection("destination");
    const bookingCollection = db.collection("booking");

    console.log("MongoDB connected ");

    // GET all destinations
    app.get("/destinations", async (req, res) => {
      try {
        const result = await destinationsCollection.find().toArray();
        res.json(result);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // GET single destination
    app.get("/destinations/:id",verifyToken, async (req, res) => {
      try {
        const id = req.params.id;

        const result = await destinationsCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!result) {
          return res
            .status(404)
            .json({ message: "Destination not found" });
        }

        res.json(result);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // POST destination
    app.post("/destination", async (req, res) => {
      try {
        const result = await destinationsCollection.insertOne(req.body);
        res.json(result);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // UPDATE destination
    app.patch("/destinations/:id", async (req, res) => {
      try {
        const id = req.params.id;

        const result = await destinationsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: req.body }
        );

        if (result.matchedCount === 0) {
          return res
            .status(404)
            .json({ message: "Destination not found" });
        }

        res.json(result);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // DELETE destination
    app.delete("/destinations/:id", async (req, res) => {
      try {
        const id = req.params.id;

        const result = await destinationsCollection.deleteOne({
          _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
          return res
            .status(404)
            .json({ message: "Destination not found" });
        }

        res.json(result);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });
   
    // CREATE booking
    app.post("/booking", async (req, res) => {
      try {
        const result = await bookingCollection.insertOne(req.body);
        res.json(result);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // GET user bookings
    app.get("/booking/:userId", async (req, res) => {
      try {
        const userId = req.params.userId;

        const result = await bookingCollection
          .find({ userId })
          .toArray();

        res.json(result);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // DELETE booking
    app.delete("/booking/:bookingId", async (req, res) => {
      try {
        const id = req.params.bookingId;

        const result = await bookingCollection.deleteOne({
          _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
          return res
            .status(404)
            .json({ message: "Booking not found" });
        }

        res.json({
          message: "Booking deleted successfully",
          result,
        });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    app.get("/", (req, res) => {
      res.send(" Wanderlust Server is Running");
    });

  } finally {
    // keep connection alive
  }
}

run().catch(console.dir);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
