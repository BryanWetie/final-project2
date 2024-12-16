require('dotenv').config();
const fs = require('fs');
const express = require('express');
const app = express();
const PORT = 9007; 
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO_CONNECTION_STRING;
const databaseAndCollection = {db: "CMSC335DB", collection:"campApplicants"};

app.set('view engine', 'ejs');
app.set('views', __dirname + '/templates');
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 

let client;

async function connectToDatabase() {
    try {
        client = new MongoClient(process.env.MONGO_CONNECTION_STRING);
        await client.connect();
        console.log("Connected to MONGODB");
        return client.db(process.env.MONGO_DB_NAME);
    } catch (err) {
        console.error("Failed to connect to MongoDB", err);
        throw err;
    }
};

const dbConnection = connectToDatabase();

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}); 


app.get("/", async (request, response) => {
    try {
        const db = await dbConnection;
        const applicants = await db.collection(databaseAndCollection.collection).find({}).toArray();
        response.render("hi.ejs", { applicants });
    } catch (error) {
        response.status(500).send("Error retrieving data");
    }
});

app.post("/save-definition", async (req, res)=>{
    const { word, definition } = req.body;
    const collection = await connectToDatabase();

    try {
        const result = await collection.insertOne({ word, definition });
        res.json({ success: true, message: 'Definition saved to MongoDB' });
    } catch (err) {
        console.error("Error saving to MongoDB", err);
        res.status(500).json({ success: false, message: 'Error saving to MongoDB' });
    }
});



