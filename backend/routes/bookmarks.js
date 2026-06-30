const express = require('express');
const router = express.Router();
const Bookmark = require('../models/Bookmark');
const authMiddleware = require('../middleware/auth');

// Proteger todas las rutas con el middleware
router.use(authMiddleware);

// GET - Obtener bookmarks del usuario autenticado
router.get('/', async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.userId });
    res.json(bookmarks);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener bookmarks' });
  }
});

// POST - Crear un bookmark
router.post('/', async (req, res) => {
  try {
    const bookmark = new Bookmark({ ...req.body, userId: req.userId });
    await bookmark.save();
    res.status(201).json(bookmark);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear bookmark' });
  }
});

// DELETE - Eliminar un bookmark
router.delete('/:id', async (req, res) => {
  try {
    await Bookmark.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Bookmark eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar bookmark' });
  }
});

module.exports = router;