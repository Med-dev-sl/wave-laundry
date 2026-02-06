import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';

const router = Router();

// GET all users
router.get('/', getAllUsers);

// GET user by ID
router.get('/:id', getUserById);

// CREATE new user
router.post('/', createUser);

// UPDATE user
router.put('/:id', updateUser);

// DELETE user
router.delete('/:id', deleteUser);

export default router;
