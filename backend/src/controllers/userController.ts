import { Request, Response } from 'express';
import pool from '../config/database.js';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM users LIMIT 100');
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
    const [rows] = await connection.query('SELECT * FROM users WHERE id = ?', [id]);
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

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        status: 'BAD_REQUEST',
        message: 'Name and email are required',
      });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO users (name, email, phone, created_at) VALUES (?, ?, ?, NOW())',
      [name, email, phone || null]
    );
    connection.release();

    res.status(201).json({
      status: 'CREATED',
      message: 'User created successfully',
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
      message: error instanceof Error ? error.message : 'Failed to create user',
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
