const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./config');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Happy Lunch API',
      version: '1.0.0',
      description: 'API documentation cho ứng dụng Happy Lunch - Tìm kiếm và quản lý nhà hàng',
      contact: {
        name: 'Happy Lunch Team',
        email: 'support@happylunch.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server (Port 5000)',
      },
        {
          url: 'https://happy-lunch.onrender.com',
          description: 'Production server',
        },
      ],
      tags: [
        {
          name: 'Restaurants',
          description: 'API quản lý nhà hàng',
        },
      ],
      components: {
        schemas: {
          Restaurant: {
            type: 'object',
            required: ['name', 'address'],
            properties: {
              id: {
                type: 'integer',
                description: 'ID tự động tăng của nhà hàng',
                example: 1,
              },
              name: {
                type: 'string',
                description: 'Tên nhà hàng',
                example: 'Phở Hà Nội',
              },
              address: {
                type: 'string',
                description: 'Địa chỉ nhà hàng',
                example: '123 Phố Huế, Hai Bà Trưng, Hà Nội',
              },
              cuisine_type: {
                type: 'string',
                description: 'Loại ẩm thực',
                example: 'Việt Nam',
              },
              description: {
                type: 'string',
                description: 'Mô tả về nhà hàng',
                example: 'Phở bò truyền thống Hà Nội',
              },
              image_url: {
                type: 'string',
                description: 'URL hình ảnh nhà hàng',
                example: 'https://example.com/image.jpg',
              },
              phone: {
                type: 'string',
                description: 'Số điện thoại',
                example: '0243123456',
              },
              opening_hours: {
                type: 'string',
                description: 'Giờ mở cửa',
                example: '07:00 - 22:00',
              },
              latitude: {
                type: 'number',
                format: 'float',
                description: 'Vĩ độ',
                example: 21.0285,
              },
              longitude: {
                type: 'number',
                format: 'float',
                description: 'Kinh độ',
                example: 105.8542,
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'Thời gian tạo',
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
                description: 'Thời gian cập nhật',
              },
            },
          },
          MenuItem: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
                description: 'ID món ăn',
              },
              restaurant_id: {
                type: 'integer',
                description: 'ID nhà hàng',
              },
              name: {
                type: 'string',
                description: 'Tên món ăn',
                example: 'Phở bò tái',
              },
              description: {
                type: 'string',
                description: 'Mô tả món ăn',
              },
              price: {
                type: 'number',
                format: 'decimal',
                description: 'Giá món ăn (VNĐ)',
                example: 50000,
              },
              image_url: {
                type: 'string',
                description: 'URL hình ảnh món ăn',
              },
            },
          },
          Review: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
                description: 'ID đánh giá',
              },
              restaurant_id: {
                type: 'integer',
                description: 'ID nhà hàng',
              },
              rating: {
                type: 'number',
                format: 'float',
                description: 'Điểm đánh giá (1-5)',
                minimum: 1,
                maximum: 5,
                example: 4.5,
              },
              comment: {
                type: 'string',
                description: 'Nội dung đánh giá',
              },
              user_name: {
                type: 'string',
                description: 'Tên người đánh giá',
              },
            },
          },
          Error: {
            type: 'object',
            properties: {
              error: {
                type: 'string',
                description: 'Thông báo lỗi',
                example: 'Restaurant not found',
              },
            },
          },
        },
      },
  },
  apis: ['./routes/*.js', './controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
