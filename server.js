const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const app = express();
const port = 3001;

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const modelsCollection = db.collection('models');

app.use(cors());
app.use(express.json());

// GET all models
app.get('/models', async (req, res) => {
  try {
    const snapshot = await modelsCollection.get();
    const models = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(models);
  } catch (error) {
    res.status(500).send('Error getting models');
  }
});

// GET single model by ID
app.get('/models/:id', async (req, res) => {
  try {
    const doc = await modelsCollection.doc(req.params.id).get();
    if (!doc.exists) return res.status(404).send('Model not found');
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).send('Error getting model');
  }
});

// POST create new model
app.post('/models', async (req, res) => {
  try {
    const { url, label, visible = true } = req.body;
    const docRef = await modelsCollection.add({ url, label, visible });
    const doc = await docRef.get();
    res.status(201).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).send('Error creating model');
  }
});

// PUT update model
app.put('/models/:id', async (req, res) => {
  try {
    const { url, label, visible } = req.body;
    const modelRef = modelsCollection.doc(req.params.id);
    const doc = await modelRef.get();
    if (!doc.exists) return res.status(404).send('Model not found');

    await modelRef.update({ url, label, visible });
    const updatedDoc = await modelRef.get();
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    res.status(500).send('Error updating model');
  }
});

// DELETE model
app.delete('/models/:id', async (req, res) => {
  try {
    const modelRef = modelsCollection.doc(req.params.id);
    const doc = await modelRef.get();
    if (!doc.exists) return res.status(404).send('Model not found');

    await modelRef.delete();
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).send('Error deleting model');
  }
});

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
