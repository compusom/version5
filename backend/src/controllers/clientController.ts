import { Request, Response } from 'express';
import { query } from '../database/connection';
import { ApiResponse, Client, CreateClientRequest, UpdateClientRequest } from '../types';
import { asyncHandler, AppError } from '../middleware/errorHandler';

export const clientController = {
  // Get all clients
  getClients: asyncHandler(async (req: Request, res: Response) => {
    const result = await query('SELECT * FROM clients WHERE active = true ORDER BY created_at DESC');
    
    const response: ApiResponse<Client[]> = {
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  }),

  // Get client by ID
  getClientById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const result = await query('SELECT * FROM clients WHERE id = ? AND active = true', [id]);
    
    if (result.length === 0) {
      throw new AppError('Client not found', 404);
    }
    
    const response: ApiResponse<Client> = {
      success: true,
      data: result[0],
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  }),

  // Create new client
  createClient: asyncHandler(async (req: Request, res: Response) => {
    const { name, meta_account_name, description }: CreateClientRequest = req.body;
    
    if (!name || name.trim().length === 0) {
      throw new AppError('Client name is required', 400);
    }
    
    const result = await query(
      'INSERT INTO clients (name, meta_account_name, description) VALUES (?, ?, ?)',
      [name.trim(), meta_account_name || null, description || null]
    );

    // Get the newly created client
    const newClient = await query('SELECT * FROM clients WHERE id = ?', [result.insertId]);
    
    const response: ApiResponse<Client> = {
      success: true,
      data: newClient[0],
      message: 'Client created successfully',
      timestamp: new Date().toISOString()
    };
    
    res.status(201).json(response);
  }),

  // Update client
  updateClient: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates: UpdateClientRequest = req.body;
    
    // Build dynamic update query
    const updateFields: string[] = [];
    const values: any[] = [];
    
    if (updates.name !== undefined) {
      updateFields.push(`name = ?`);
      values.push(updates.name.trim());
    }
    
    if (updates.meta_account_name !== undefined) {
      updateFields.push(`meta_account_name = ?`);
      values.push(updates.meta_account_name);
    }
    
    if (updates.description !== undefined) {
      updateFields.push(`description = ?`);
      values.push(updates.description);
    }
    
    if (updates.active !== undefined) {
      updateFields.push(`active = ?`);
      values.push(updates.active);
    }
    
    if (updateFields.length === 0) {
      throw new AppError('No fields to update', 400);
    }
    
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const updateQuery = `
      UPDATE clients 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `;
    
    const result = await query(updateQuery, values);
    
    if (result.affectedRows === 0) {
      throw new AppError('Client not found', 404);
    }

    // Get the updated client
    const updatedClient = await query('SELECT * FROM clients WHERE id = ?', [id]);
    
    const response: ApiResponse<Client> = {
      success: true,
      data: updatedClient[0],
      message: 'Client updated successfully',
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  }),

  // Delete client (soft delete)
  deleteClient: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const result = await query(
      'UPDATE clients SET active = false, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND active = true',
      [id]
    );
    
    if (result.affectedRows === 0) {
      throw new AppError('Client not found', 404);
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'Client deleted successfully',
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  }),

  // Get clients with Meta account names (for API sync)
  getClientsWithMetaAccounts: asyncHandler(async (req: Request, res: Response) => {
    const result = await query(
      'SELECT * FROM clients WHERE active = true AND meta_account_name IS NOT NULL AND meta_account_name != \'\' ORDER BY name'
    );
    
    const response: ApiResponse<Client[]> = {
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  })
};
