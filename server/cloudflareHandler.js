const { R2 } = require('@cloudflare/r2');
require('dotenv').config(); // Для использования переменных окружения

// Инициализация клиента R2
const r2 = new R2({
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  bucket: process.env.CLOUDFLARE_BUCKET_NAME,
});

/**
 * Функция для загрузки изображений в Cloudflare R2 и получения ссылок
 * @param {Array<Object>} imageArray - Массив объектов с полем photo (путь или base64)
 * @returns {Promise<Array<Object>>} - Массив с замененными ссылками
 */
async function uploadImagesToCloudflare(imageArray) {
  try {
    const processedImages = await Promise.all(imageArray.map(async (item) => {
      if (!item.photo) return item; // Пропускаем, если нет фото

      let fileBuffer;
      let contentType = ('image/jpeg',"image/jpeg", "image/webp"); // По умолчанию

      // Обработка в зависимости от формата (путь или base64)
      if (typeof item.photo === 'string' && item.photo.startsWith('data:')) {
        // Если приходит base64
        const base64Data = item.photo.split(',')[1];
        fileBuffer = Buffer.from(base64Data, 'base64');
        contentType = item.photo.match(/data:(image\/[a-zA-Z]+);/)?.[1] || 'image/jpeg';
      } else {
        // Если приходит путь к файлу
        const fs = require('fs');
        const path = require('path');
        const filePath = path.resolve(__dirname, item.photo);
        fileBuffer = fs.readFileSync(filePath);
      }

      // Генерация уникального имени файла
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${contentType.split('/')[1]}`;

      // Загрузка в R2
      await r2.put(fileName, fileBuffer, {
        contentType,
      });

      // Формирование публичного URL
      const publicUrl = `https://${process.env.CLOUDFLARE_BUCKET_NAME}.${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${fileName}`;

      // Возвращаем новый объект с замененным URL
      return {
        ...item,
        photo: publicUrl,
      };
    }));

    return processedImages;
  } catch (error) {
    console.error('Ошибка при загрузке изображений в Cloudflare:', error);
    throw new Error('Не удалось обработать изображения');
  }
}

module.exports = { uploadImagesToCloudflare };