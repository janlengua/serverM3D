const request = require('supertest');
const admin = require('firebase-admin');
const app = require('./server');  // Asegúrate de que el archivo de tu servidor se exporte correctamente

jest.mock('firebase-admin', () => {
  const mockModelsCollection = {
    get: jest.fn(() => ({
      docs: [
        {
          id: '1',
          data: () => ({ url: 'model1.url', label: 'Model 1', visible: true }),
        },
        {
          id: '2',
          data: () => ({ url: 'model2.url', label: 'Model 2', visible: false }),
        },
      ],
    })),
    doc: jest.fn((id) => ({
      get: jest.fn(() => ({
        exists: id === '1',
        data: () => ({ url: `model${id}.url`, label: `Model ${id}`, visible: true }),
      })),
      update: jest.fn(),
      delete: jest.fn(),
    })),
    add: jest.fn(() => ({
      get: jest.fn(() => ({
        id: '3',
        data: () => ({ url: 'model3.url', label: 'Model 3', visible: true }),
      })),
    })),
  };

  return {
    firestore: jest.fn(() => ({
      collection: jest.fn(() => mockModelsCollection),
    })),
  };
});

describe('Models API', () => {
  it('should return all models', async () => {
    const response = await request(app).get('/models');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { id: '1', url: 'model1.url', label: 'Model 1', visible: true },
      { id: '2', url: 'model2.url', label: 'Model 2', visible: false },
    ]);
  });

  it('should return a single model by ID', async () => {
    const response = await request(app).get('/models/1');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: '1',
      url: 'model1.url',
      label: 'Model 1',
      visible: true,
    });
  });

  it('should return 404 when model is not found by ID', async () => {
    const response = await request(app).get('/models/999');
    expect(response.status).toBe(404);
    expect(response.text).toBe('Model not found');
  });

  it('should create a new model', async () => {
    const newModel = { url: 'model3.url', label: 'Model 3', visible: true };
    const response = await request(app).post('/models').send(newModel);
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      id: '3',
      url: 'model3.url',
      label: 'Model 3',
      visible: true,
    });
  });

  it('should update an existing model', async () => {
    const updatedModel = { url: 'updated.url', label: 'Updated Model', visible: false };
    const response = await request(app).put('/models/1').send(updatedModel);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: '1',
      url: 'updated.url',
      label: 'Updated Model',
      visible: false,
    });
  });

  it('should return 404 when trying to update a non-existing model', async () => {
    const updatedModel = { url: 'updated.url', label: 'Updated Model', visible: false };
    const response = await request(app).put('/models/999').send(updatedModel);
    expect(response.status).toBe(404);
    expect(response.text).toBe('Model not found');
  });

  it('should delete a model', async () => {
    const response = await request(app).delete('/models/1');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: '1',
      url: 'model1.url',
      label: 'Model 1',
      visible: true,
    });
  });

  it('should return 404 when trying to delete a non-existing model', async () => {
    const response = await request(app).delete('/models/999');
    expect(response.status).toBe(404);
    expect(response.text).toBe('Model not found');
  });
});
