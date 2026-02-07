import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/database';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({
        status: 'BAD_REQUEST',
        message: 'All fields are required',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: 'BAD_REQUEST',
        message: 'Passwords do not match',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 'BAD_REQUEST',
        message: 'Password must be at least 6 characters',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const connection = await pool.getConnection();

    // Check if email or phone already exists
    const [existingUser] = await connection.query(
      'SELECT id FROM users WHERE email = ? OR phone = ? LIMIT 1',
      [email, phone]
    );

    if ((existingUser as any[]).length > 0) {
      connection.release();
      return res.status(409).json({
        status: 'CONFLICT',
        message: 'Email or phone number already registered',
      });
    }

    // Insert user
    const [result] = await connection.query(
      'INSERT INTO users (name, email, phone, password, created_at) VALUES (?, ?, ?, ?, NOW())',
      [name, email, phone, hashedPassword]
    );
    connection.release();

    res.status(201).json({
      status: 'CREATED',
      message: 'User registered successfully',
      data: {
        id: (result as any).insertId,
        name,
        email,
        phone,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error instanceof Error ? error.message : 'Registration failed',
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body;

    // Validation
    if (!phone || !password) {
      return res.status(400).json({
        status: 'BAD_REQUEST',
        message: 'Phone number and password are required',
      });
    }

    const connection = await pool.getConnection();

    // Find user by phone
    const [users] = await connection.query('SELECT * FROM users WHERE phone = ? LIMIT 1', [
      phone,
    ]);
    connection.release();

    const userArray = users as any[];
    if (userArray.length === 0) {
      return res.status(401).json({
        status: 'UNAUTHORIZED',
        message: 'Invalid phone number or password',
      });
    }

    const user = userArray[0];

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'UNAUTHORIZED',
        message: 'Invalid phone number or password',
      });
    }

    // Return user data (without password)
    res.status(200).json({
      status: 'SUCCESS',
      message: 'Login successful',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error instanceof Error ? error.message : 'Login failed',
    });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT id, name, email, phone, created_at FROM users LIMIT 100');
    connection.release();

    res.status(200).json({
      status: 'SUCCESS',
      data: rows,
      count: (rows as any[]).length,
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error instanceof Error ? error.message : 'Failed to fetch users',
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT id, name, email, phone, created_at FROM users WHERE id = ?', [id]);
    connection.release();

    const rowsArray = rows as any[];
    if (rowsArray.length === 0) {
      return res.status(404).json({
        status: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'SUCCESS',
      data: rowsArray[0],
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error instanceof Error ? error.message : 'Failed to fetch user',
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    const connection = await pool.getConnection();
    await connection.query('UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?', [
      name,
      email,
      phone,
      id,
    ]);
    connection.release();

    res.status(200).json({
      status: 'SUCCESS',
      message: 'User updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error instanceof Error ? error.message : 'Failed to update user',
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const connection = await pool.getConnection();
    await connection.query('DELETE FROM users WHERE id = ?', [id]);
    connection.release();

    res.status(200).json({
      status: 'SUCCESS',
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error instanceof Error ? error.message : 'Failed to delete user',
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        status: 'BAD_REQUEST',
        message: 'Email is required',
      });
    }

    const connection = await pool.getConnection();

    // Check if user exists
    const [users] = await connection.query('SELECT id, email FROM users WHERE email = ?', [
      email,
    ]);
    const userArray = users as any[];

    if (userArray.length === 0) {
      connection.release();
      return res.status(404).json({
        status: 'NOT_FOUND',
        message: 'Email not found',
      });
    }

    // Generate reset token (in production, use crypto.randomBytes)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Update user with reset token
    await connection.query(
      'UPDATE users SET reset_token = ?, reset_token_expires_at = ? WHERE email = ?',
      [resetToken, expiresAt, email]
    );
    connection.release();

    // In production, send email with reset link
    // For now, log the token (in real app, send via email service)
    console.log(`Reset token for ${email}: ${resetToken}`);

    res.status(200).json({
      status: 'SUCCESS',
      message: 'Password reset email sent successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error instanceof Error ? error.message : 'Failed to process password reset request',
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    // Validation
    if (!resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({
        status: 'BAD_REQUEST',
        message: 'All fields are required',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: 'BAD_REQUEST',
        message: 'Passwords do not match',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: 'BAD_REQUEST',
        message: 'Password must be at least 6 characters',
      });
    }

    const connection = await pool.getConnection();

    // Find user with valid reset token
    const [users] = await connection.query(
      'SELECT id, email FROM users WHERE reset_token = ? AND reset_token_expires_at > NOW()',
      [resetToken]
    );
    const userArray = users as any[];

    if (userArray.length === 0) {
      connection.release();
      return res.status(400).json({
        status: 'BAD_REQUEST',
        message: 'Invalid or expired reset token',
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await connection.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires_at = NULL WHERE id = ?',
      [hashedPassword, userArray[0].id]
    );
    connection.release();

    res.status(200).json({
      status: 'SUCCESS',
      message: 'Password reset successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error instanceof Error ? error.message : 'Failed to reset password',
    });
  }
};

