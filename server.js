  const express = require('express');
  const cors = require('cors');
  const admin = require('firebase-admin');
  const axios = require('axios');
  require('dotenv').config();


  const app = express();
  const port = process.env.PORT;

  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("API Key: ", serviceAccount);
  const db = admin.firestore();
  const buildingsCollection = db.collection('buildings');
  const floorsCollection = db.collection('floors');
  const formsCollection = db.collection('forms');

  // Middleware
  const corsOptions = {
    origin: '*', // Permite cualquier dominio
    credentials: true, // Permite enviar credenciales
  };

  app.use(cors(corsOptions));
  app.use(express.json());

  // --- Autenticación Middleware ---
  const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).send('Unauthorized');
    const idToken = authHeader.split('Bearer ')[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      req.user = decodedToken;
      next();
    } catch (err) {
      res.status(401).send('Invalid token', error);
    }
  };

  // --- BUILDINGS ---

  // Pública
  app.get('/buildings', async (req, res) => {
    try {
      const snapshot = await buildingsCollection.get();
      const buildings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(buildings);
    } catch (error) {
      res.status(500).send('Error getting buildings', error);
    }
  });

  // Protegidas
  app.post('/buildings', authenticate, async (req, res) => {
    try {
      const { nombre, descripcion, urlModelo, urlWeb, latitud, longitud, ubicacion, scale } = req.body;
      const docRef = await buildingsCollection.add({ nombre, descripcion, urlModelo, urlWeb, latitud, longitud, ubicacion, scale });
      const doc = await docRef.get();
      res.status(201).json({ id: doc.id, ...doc.data() });
    } catch (error) {
      res.status(500).send('Error creating building: '+ error);
    }
  });

  app.get('/buildings/:id', async (req, res) => {
    try {
      const doc = await buildingsCollection.doc(req.params.id).get();
      if (!doc.exists) return res.status(404).send('Building not found');
      res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
      res.status(500).send('Error getting building'+ error);
    }
  });

  app.put('/buildings/:id', authenticate, async (req, res) => {
    try {
      const { nombre, descripcion, urlModelo, urlWeb, latitud, longitud, ubicacion, scale } = req.body;
      const docRef = buildingsCollection.doc(req.params.id);
      const doc = await docRef.get();
      if (!doc.exists) return res.status(404).send('Building not found');

      await docRef.update({ nombre, descripcion, urlModelo, urlWeb, latitud, longitud, ubicacion, scale });
      const updatedDoc = await docRef.get();
      res.json({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (error) {
      res.status(500).send('Error updating building', error);
    }
  });

  app.delete('/buildings/:id', authenticate, async (req, res) => {
    try {
      const docRef = buildingsCollection.doc(req.params.id);
      const doc = await docRef.get();
      if (!doc.exists) return res.status(404).send('Building not found');

      await docRef.delete();
      res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
      res.status(500).send('Error deleting building', error);
    }
  });

  // --- FLOORS ---

  // Pública
  app.get('/floors', async (req, res) => {
    try {
      const snapshot = await floorsCollection.get();
      const floors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(floors);
    } catch (error) {
      res.status(500).send('Error getting floors'+ error);
    }
  });
  // Obtener floors por buildingId (público)
  app.get('/floors/building/:buildingId', async (req, res) => {
    const { buildingId } = req.params;
    try {
      const snapshot = await floorsCollection.where('buildingId', '==', buildingId).get();
      const floors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(floors);
    } catch (error) {
      res.status(500).send('Error getting floors by buildingId');
    }
  });

  // Protegidas
  app.post('/floors', authenticate, async (req, res) => {
    try {
      const { nombre, urlModelos = [], descripcion, scale, activo = true, buildingId } = req.body;
      const docRef = await floorsCollection.add({ nombre, urlModelos, descripcion, scale, activo, buildingId });
      const doc = await docRef.get();
      res.status(201).json({ id: doc.id, ...doc.data() });
    } catch (error) {
      res.status(500).send('Error creating floor' + error);
    }
  });

  app.get('/floors/:id', async (req, res) => {
    try {
      const doc = await floorsCollection.doc(req.params.id).get();
      if (!doc.exists) return res.status(404).send('Floor not found');
      res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
      res.status(500).send('Error getting floor', error);
    }
  });

  app.put('/floors/:id', authenticate, async (req, res) => {
    try {
      const { nombre, urlModelos, descripcion, scale, activo, buildingId } = req.body;
      const docRef = floorsCollection.doc(req.params.id);
      const doc = await docRef.get();
      if (!doc.exists) return res.status(404).send('Floor not found');

      await docRef.update({ nombre, urlModelos, descripcion, scale, activo, buildingId });
      const updatedDoc = await docRef.get();
      res.json({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (error) {
      res.status(500).send('Error updating floor', error);
    }
  });

  app.delete('/floors/:id', authenticate, async (req, res) => {
    try {
      const docRef = floorsCollection.doc(req.params.id);
      const doc = await docRef.get();
      if (!doc.exists) return res.status(404).send('Floor not found');

      await docRef.delete();
      res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
      res.status(500).send('Error deleting floor', error);
    }
  });

  // --- FORMS ---

  // Pública
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

  // Protegidas
  app.get('/forms', authenticate, async (req, res) => {
    try {
      const snapshot = await formsCollection.get();
      const forms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(forms);
    } catch (error) {
      res.status(500).send('Error getting forms');
    }
  });

  app.get('/forms/:id', authenticate, async (req, res) => {
    try {
      const doc = await formsCollection.doc(req.params.id).get();
      if (!doc.exists) return res.status(404).send('Form not found');
      res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
      res.status(500).send('Error getting form');
    }
  });

  app.put('/forms/:id', authenticate, async (req, res) => {
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

  app.delete('/forms/:id', authenticate, async (req, res) => {
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

  app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const apiKey = process.env.FIREBASE_API_KEY;
      const response = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
        email,
        password,
        returnSecureToken: true,
      });
      res.json({ token: response.data.idToken });
    } catch (err) {
      console.error('Error details:', err.response ? err.response.data : err);
      res.status(401).send(err.response ? err.response.data.error.message : 'Login failed');
    }
  });


  app.get('/user', authenticate, async (req, res) => {
    try {
      const user = await admin.auth().getUser(req.user.uid);
      res.json(user);
    } catch (err) {
      res.status(500).send('Error getting user');
    }
  });

  app.post('/user', authenticate, async (req, res) => {
    const { email, password, displayName } = req.body;
    try {
      const user = await admin.auth().createUser({ email, password, displayName });
      res.status(201).json(user);
    } catch (err) {
      res.status(500).send('Error creating user');
    }
  });

  app.put('/user/password', authenticate, async (req, res) => {
    const { newPassword } = req.body;
    try {
      await admin.auth().updateUser(req.user.uid, { password: newPassword });
      res.send('Password updated');
    } catch (err) {
      res.status(500).send('Error updating password');
    }
  });

  app.delete('/user', authenticate, async (req, res) => {
    try {
      await admin.auth().deleteUser(req.user.uid);
      res.send('User deleted');
    } catch (err) {
      res.status(500).send('Error deleting user');
    }
  });
  app.use((req, res, next) => {
    console.log(`Received request: ${req.method} ${req.originalUrl}`);
    next();
  });
  // --- START SERVER ---
  app.listen(port, () => {
    console.log(`API server running`);
  });


  module.exports = app;
