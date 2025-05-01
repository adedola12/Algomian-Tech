// routes/roleRoutes.js
import express from 'express';
import Role from '../models/roleModel.js';
const router = express.Router();

router.post('/admin/roles', async (req, res) => {
  try {
    const role = await Role.create(req.body);
    res.status(201).json(role);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
