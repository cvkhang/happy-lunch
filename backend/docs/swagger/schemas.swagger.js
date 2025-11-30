/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         name:
 *           type: string
 *           example: Nguyen Van A
 *         avatar_url:
 *           type: string
 *           format: uri
 *           example: https://example.com/avatar.jpg
 *         intro:
 *           type: string
 *           example: Food lover from Hanoi
 *         address:
 *           type: string
 *           example: Hanoi, Vietnam
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           example: user
 *         account_type:
 *           type: string
 *           enum: [personal, family]
 *           example: personal
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     Restaurant:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Pho 24
 *         address:
 *           type: string
 *           example: 123 Hang Bong, Hoan Kiem, Hanoi
 *         cuisine_type:
 *           type: string
 *           example: Vietnamese
 *         description:
 *           type: string
 *           example: Famous pho restaurant in Hanoi
 *         image_url:
 *           type: string
 *           format: uri
 *           example: https://example.com/restaurant.jpg
 *         rating:
 *           type: number
 *           format: float
 *           example: 4.5
 *         phone:
 *           type: string
 *           example: 024-1234567
 *         opening_hours:
 *           type: string
 *           example: 08:00 - 22:00
 *         latitude:
 *           type: number
 *           format: float
 *           example: 21.0285
 *         longitude:
 *           type: number
 *           format: float
 *           example: 105.8542
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     MenuItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         restaurant_id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Pho Bo
 *         description:
 *           type: string
 *           example: Beef noodle soup
 *         price:
 *           type: number
 *           format: decimal
 *           example: 50000
 *         image_url:
 *           type: string
 *           format: uri
 *           example: https://example.com/menu-item.jpg
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     Review:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         user_id:
 *           type: integer
 *           example: 1
 *         restaurant_id:
 *           type: integer
 *           example: 1
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           example: 5
 *         comment:
 *           type: string
 *           example: Great food and service!
 *         image_url:
 *           type: string
 *           format: uri
 *           example: https://example.com/review-photo.jpg
 *         like_count:
 *           type: integer
 *           example: 10
 *         liked_by_user:
 *           type: boolean
 *           example: false
 *         User:
 *           $ref: '#/components/schemas/User'
 *         Restaurant:
 *           $ref: '#/components/schemas/Restaurant'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Error message
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               msg:
 *                 type: string
 *               param:
 *                 type: string
 *               location:
 *                 type: string
 *
 *     Pagination:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 100
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 10
 *         totalPages:
 *           type: integer
 *           example: 10
 *
 *   responses:
 *     Unauthorized:
 *       description: Unauthorized - Invalid or missing token
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "Unauthorized"
 *     
 *     Forbidden:
 *       description: Forbidden - Admin access required
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "Admin access required"
 *     
 *     NotFound:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "Resource not found"
 *     
 *     ValidationError:
 *       description: Validation error
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Enter your JWT token in the format **Bearer &lt;token&gt;**
 */
