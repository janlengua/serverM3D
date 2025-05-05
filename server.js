const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Datos simulados en memoria
let models = [
  { id: 1, url: '/nexus/P0B.glb', label: 'Base P0', visible: true },
  { id: 2, url: '/nexus/P0O0.glb', label: 'Oficina 0', visible: true },
  { id: 3, url: '/nexus/P0O1.glb', label: 'Oficina 1', visible: true },
  { id: 4, url: '/nexus/P0O2.glb', label: 'Oficina 2', visible: true },
];

// GET all models
app.get('/models', (req, res) => {
  res.json(models);
});

// GET single model by ID
app.get('/models/:id', (req, res) => {
  const model = models.find((m) => m.id === parseInt(req.params.id));
  if (!model) return res.status(404).send('Model not found');
  res.json(model);
});

// POST create new model
app.post('/models', (req, res) => {
  const { url, label, visible } = req.body;
  const newModel = {
    id: models.length + 1,
    url,
    label,
    visible: visible !== undefined ? visible : true,
  };
  models.push(newModel);
  res.status(201).json(newModel);
});

// PUT update model
app.put('/models/:id', (req, res) => {
  const model = models.find((m) => m.id === parseInt(req.params.id));
  if (!model) return res.status(404).send('Model not found');
  const { url, label, visible } = req.body;
  if (url !== undefined) model.url = url;
  if (label !== undefined) model.label = label;
  if (visible !== undefined) model.visible = visible;
  res.json(model);
});

// DELETE model
app.delete('/models/:id', (req, res) => {
  const index = models.findIndex((m) => m.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).send('Model not found');
  const deletedModel = models.splice(index, 1);
  res.json(deletedModel[0]);
});

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
