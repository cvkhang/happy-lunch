const express = require('express');
const router = express.Router();
const RestaurantController = require('../controllers/RestaurantController');

/**
 * @swagger
 * /api/restaurants:
 *   get:
 *     summary: Lấy danh sách tất cả nhà hàng
 *     description: Lấy danh sách nhà hàng với khả năng tìm kiếm theo tên, địa chỉ hoặc loại ẩm thực
 *     tags: [Restaurants]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm (tên, địa chỉ, loại ẩm thực)
 *         example: "phở"
 *     responses:
 *       200:
 *         description: Danh sách nhà hàng
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Restaurant'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', RestaurantController.getAllRestaurants.bind(RestaurantController));

/**
 * @swagger
 * /api/restaurants/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết nhà hàng
 *     description: Lấy thông tin chi tiết của một nhà hàng theo ID, bao gồm menu và đánh giá
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của nhà hàng
 *         example: 1
 *     responses:
 *       200:
 *         description: Thông tin nhà hàng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Restaurant'
 *       404:
 *         description: Không tìm thấy nhà hàng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', RestaurantController.getRestaurantById.bind(RestaurantController));

/**
 * @swagger
 * /api/restaurants:
 *   post:
 *     summary: Tạo nhà hàng mới
 *     description: Thêm một nhà hàng mới vào hệ thống
 *     tags: [Restaurants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Phở Hà Nội"
 *               address:
 *                 type: string
 *                 example: "123 Phố Huế, Hai Bà Trưng, Hà Nội"
 *               cuisine_type:
 *                 type: string
 *                 example: "Việt Nam"
 *               description:
 *                 type: string
 *                 example: "Phở bò truyền thống Hà Nội"
 *               image_url:
 *                 type: string
 *                 example: "https://example.com/image.jpg"
 *               phone:
 *                 type: string
 *                 example: "0243123456"
 *               opening_hours:
 *                 type: string
 *                 example: "07:00 - 22:00"
 *               latitude:
 *                 type: number
 *                 format: float
 *                 example: 21.0285
 *               longitude:
 *                 type: number
 *                 format: float
 *                 example: 105.8542
 *     responses:
 *       201:
 *         description: Nhà hàng được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Restaurant'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', RestaurantController.createRestaurant.bind(RestaurantController));

/**
 * @swagger
 * /api/restaurants/{id}:
 *   put:
 *     summary: Cập nhật thông tin nhà hàng
 *     description: Cập nhật thông tin của một nhà hàng theo ID
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của nhà hàng cần cập nhật
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               cuisine_type:
 *                 type: string
 *               description:
 *                 type: string
 *               image_url:
 *                 type: string
 *               phone:
 *                 type: string
 *               opening_hours:
 *                 type: string
 *               latitude:
 *                 type: number
 *                 format: float
 *               longitude:
 *                 type: number
 *                 format: float
 *     responses:
 *       200:
 *         description: Nhà hàng được cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Restaurant'
 *       404:
 *         description: Không tìm thấy nhà hàng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', RestaurantController.updateRestaurant.bind(RestaurantController));

/**
 * @swagger
 * /api/restaurants/{id}:
 *   delete:
 *     summary: Xóa nhà hàng
 *     description: Xóa một nhà hàng khỏi hệ thống theo ID
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của nhà hàng cần xóa
 *         example: 1
 *     responses:
 *       200:
 *         description: Nhà hàng được xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Restaurant deleted successfully"
 *       404:
 *         description: Không tìm thấy nhà hàng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', RestaurantController.deleteRestaurant.bind(RestaurantController));

module.exports = router;
