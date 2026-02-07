import { Router } from 'express';
import {
    deleteUser,
    forgotPassword,
    getAllUsers,
    getUserById,
    login,
    register,
    resetPassword,
    updateUser,
} from '../controllers/userController';

const router = Router();

// Auth Routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// User Routes
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;