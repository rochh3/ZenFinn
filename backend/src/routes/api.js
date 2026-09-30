const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');

const txController = require('../controllers/transactionsController');
const catController = require('../controllers/categoriesController');
const bgController = require('../controllers/budgetsController');
const { chat } = require('../controllers/chatController');

// Public chat endpoint (no auth required — mobile app uses it directly)
router.post('/chat', chat);

// All API routes below are protected by JWT authentication
router.use(authenticateUser);

// Transactions CRUD
router.get('/transactions', txController.getTransactions);
router.post('/transactions', txController.createTransaction);
router.put('/transactions/:id', txController.updateTransaction);
router.delete('/transactions/:id', txController.deleteTransaction);

// Categories CRUD
router.get('/categories', catController.getCategories);
router.post('/categories', catController.createCategory);
router.put('/categories/:id/archive', catController.archiveCategory);

// Budgets/Plans CRUD
router.get('/budgets', bgController.getBudgets);
router.post('/budgets', bgController.createBudget);

module.exports = router;


// All API routes are protected by JWT authentication
router.use(authenticateUser);

// Transactions CRUD
router.get('/transactions', txController.getTransactions);
router.post('/transactions', txController.createTransaction);
router.put('/transactions/:id', txController.updateTransaction);
router.delete('/transactions/:id', txController.deleteTransaction);

// Categories CRUD
router.get('/categories', catController.getCategories);
router.post('/categories', catController.createCategory);
router.put('/categories/:id/archive', catController.archiveCategory); // Logical delete

// Budgets/Plans CRUD
router.get('/budgets', bgController.getBudgets);
router.post('/budgets', bgController.createBudget);

module.exports = router;
