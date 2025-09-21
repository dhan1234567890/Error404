// Express API for MongoDB Atlas
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI || 'YOUR_MONGODB_ATLAS_URI';
const client = new MongoClient(uri);

const dbName = 'kisaan';

app.get('/api/actionPlans', async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const plans = await db.collection('actionPlans').find().toArray();
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/actionPlans', async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const result = await db.collection('actionPlans').insertOne(req.body);
    res.json(result.ops[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tasks', async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const tasks = await db.collection('tasks').find().toArray();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const result = await db.collection('tasks').insertOne(req.body);
    res.json(result.ops[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const { id } = req.params;
    const result = await db.collection('tasks').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: req.body },
      { returnDocument: 'after' }
    );
    res.json(result.value);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API server running on port ${PORT}`));
