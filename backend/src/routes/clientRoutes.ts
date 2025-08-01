import { Router } from 'express';
import { clientController } from '../controllers/clientController';

const router = Router();

// GET /api/clients - Get all clients
router.get('/', clientController.getClients);

// GET /api/clients/meta-accounts - Get clients with Meta accounts
router.get('/meta-accounts', clientController.getClientsWithMetaAccounts);

// GET /api/clients/:id - Get client by ID
router.get('/:id', clientController.getClientById);

// POST /api/clients - Create new client
router.post('/', clientController.createClient);

// PUT /api/clients/:id - Update client
router.put('/:id', clientController.updateClient);

// DELETE /api/clients/:id - Delete client (soft delete)
router.delete('/:id', clientController.deleteClient);

export default router;
