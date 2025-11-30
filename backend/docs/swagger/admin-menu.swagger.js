/**
 * @swagger
 * tags:
 *   - name: Admin - Menu
 *     description: Menu management endpoints (Admin only)
 */

/**
 * @swagger
 * /api/admin/menu-items:
 *   get:
 *     summary: Get all menu items
 *     tags: [Admin - Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: restaurant_id
 *         schema:
 *           type: integer
 *         description: Filter by restaurant ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Menu items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 menuItems:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MenuItem'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /api/admin/menu-items/{id}:
 *   get:
 *     summary: Get menu item by ID
 *     tags: [Admin - Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Menu item ID
 *     responses:
 *       200:
 *         description: Menu item details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 menuItem:
 *                   $ref: '#/components/schemas/MenuItem'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /api/admin/menu-items:
 *   post:
 *     summary: Create new menu item
 *     tags: [Admin - Menu]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurant_id
 *               - name
 *               - price
 *             properties:
 *               restaurant_id:
 *                 type: integer
 *                 example: 1
 *               name:
 *                 type: string
 *                 example: "Sushi Platter"
 *               description:
 *                 type: string
 *                 example: "Fresh salmon and tuna sushi"
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 150000
 *               image_url:
 *                 type: string
 *                 example: "https://example.com/sushi.jpg"
 *     responses:
 *       201:
 *         description: Menu item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Menu item created successfully"
 *                 menuItem:
 *                   $ref: '#/components/schemas/MenuItem'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         description: Restaurant not found
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /api/admin/menu-items/{id}:
 *   put:
 *     summary: Update menu item
 *     tags: [Admin - Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Menu item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Premium Sushi Platter"
 *               description:
 *                 type: string
 *                 example: "Premium selection of fresh sushi"
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 200000
 *               image_url:
 *                 type: string
 *                 example: "https://example.com/premium-sushi.jpg"
 *     responses:
 *       200:
 *         description: Menu item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Menu item updated successfully"
 *                 menuItem:
 *                   $ref: '#/components/schemas/MenuItem'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /api/admin/menu-items/{id}:
 *   delete:
 *     summary: Delete menu item
 *     tags: [Admin - Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Menu item ID
 *     responses:
 *       200:
 *         description: Menu item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Menu item deleted successfully"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

module.exports = {};
