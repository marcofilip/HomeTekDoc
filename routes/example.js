const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /example:
 *   get:
 *     summary: Retrieve a list of examples
 *     responses:
 *       200:
 *         description: A list of examples
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
router.get('/example', (req, res) => {
    res.json(['example1', 'example2']);
});

module.exports = router;