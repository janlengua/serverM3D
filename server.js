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
const buildingsCollection = db.collection('buildings');
const floorsCollection = db.collection('floors');
const formsCollection = db.collection('forms');

app.use(cors());
app.use(express.json());

// --- BUILDINGS ---

// Create building
app.post('/buildings', async (req, res) => {
  try {
    const { nombre, urlModelo, descripcion, activo = true } = req.body;
    const docRef = await buildingsCollection.add({ nombre, urlModelo, descripcion, activo });
    const doc = await docRef.get();
    res.status(201).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).send('Error creating building');
  }
});

// Get all buildings
app.get('/buildings', async (req, res) => {
  try {
    const snapshot = await buildingsCollection.get();
    const buildings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(buildings);
  } catch (error) {
    res.status(500).send('Error getting buildings');
  }
});

// Get single building
app.get('/buildings/:id', async (req, res) => {
  try {
    const doc = await buildingsCollection.doc(req.params.id).get();
    if (!doc.exists) return res.status(404).send('Building not found');
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).send('Error getting building');
  }
});

// Update building
app.put('/buildings/:id', async (req, res) => {
  try {
    const { nombre, urlModelo, descripcion, activo } = req.body;
    const docRef = buildingsCollection.doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).send('Building not found');

    await docRef.update({ nombre, urlModelo, descripcion, activo });
    const updatedDoc = await docRef.get();
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    res.status(500).send('Error updating building');
  }
});

// Delete building
app.delete('/buildings/:id', async (req, res) => {
  try {
    const docRef = buildingsCollection.doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).send('Building not found');

    await docRef.delete();
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).send('Error deleting building');
  }
});

// --- FLOORS ---

// Create floor
app.post('/floors', async (req, res) => {
  try {
    const { nombre, urlModelos = [], descripcion, activo = true, buildingId } = req.body;
    const docRef = await floorsCollection.add({ nombre, urlModelos, descripcion, activo, buildingId });
    const doc = await docRef.get();
    res.status(201).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).send('Error creating floor');
  }
});

// Get all floors
app.get('/floors', async (req, res) => {
  try {
    const snapshot = await floorsCollection.get();
    const floors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(floors);
  } catch (error) {
    res.status(500).send('Error getting floors');
  }
});

// Get single floor
app.get('/floors/:id', async (req, res) => {
  try {
    const doc = await floorsCollection.doc(req.params.id).get();
    if (!doc.exists) return res.status(404).send('Floor not found');
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).send('Error getting floor');
  }
});

// Update floor
app.put('/floors/:id', async (req, res) => {
  try {
    const { nombre, urlModelos, descripcion, activo, buildingId } = req.body;
    const docRef = floorsCollection.doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).send('Floor not found');

    await docRef.update({ nombre, urlModelos, descripcion, activo, buildingId });
    const updatedDoc = await docRef.get();
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    res.status(500).send('Error updating floor');
  }
});

// Delete floor
app.delete('/floors/:id', async (req, res) => {
  try {
    const docRef = floorsCollection.doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).send('Floor not found');

    await docRef.delete();
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).send('Error deleting floor');
  }
});

// --- FORMS ---

// Create form
app.post('/forms', async (req, res) => {
  try {
    const { nombre, email, texto, buildingId } = req.body;
    const docRef = await formsCollection.add({ nombre, email, texto, buildingId });
    const doc = await docRef.get();
    res.status(201).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).send('Error creating form');
  }
});

// Get all forms
app.get('/forms', async (req, res) => {
  try {
    const snapshot = await formsCollection.get();
    const forms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(forms);
  } catch (error) {
    res.status(500).send('Error getting forms');
  }
});

// Get single form
app.get('/forms/:id', async (req, res) => {
  try {
    const doc = await formsCollection.doc(req.params.id).get();
    if (!doc.exists) return res.status(404).send('Form not found');
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).send('Error getting form');
  }
});

// Update form
app.put('/forms/:id', async (req, res) => {
  try {
    const { nombre, email, texto, buildingId } = req.body;
    const docRef = formsCollection.doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).send('Form not found');

    await docRef.update({ nombre, email, texto, buildingId });
    const updatedDoc = await docRef.get();
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    res.status(500).send('Error updating form');
  }
});

// Delete form
app.delete('/forms/:id', async (req, res) => {
  try {
    const docRef = formsCollection.doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).send('Form not found');

    await docRef.delete();
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).send('Error deleting form');
  }
});

app.listen(port, () => {
  console.log(`API server running on https://serverm3d.onrender.com/`);
});

module.exports = app;
