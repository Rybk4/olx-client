const { R2 } = require('node-cloudflare-r2');
require('dotenv').config(); // Для использования переменных окружения

// Инициализация клиента R2
const r2 = new R2({
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
});

// Создаем объект bucket для работы с конкретным бакетом
const bucket = r2.bucket(process.env.CLOUDFLARE_BUCKET_NAME);

/**
 * Функция для загрузки изображений в Cloudflare R2 и получения ссылок
 * @param {Array<Object>} imageArray - Массив объектов с полем photo (массив путей или base64)
 * @returns {Promise<Array<Object>>} - Массив с замененными ссылками в поле photo
 */
async function uploadImagesToCloudflare(imageArray) {
  try {
    const processedImages = await Promise.all(imageArray.map(async (item) => {
      // Пропускаем, если нет поля photo или оно пустое
      if (!item.photo || !Array.isArray(item.photo) || item.photo.length === 0) {
        return item;
      }

      // Обрабатываем каждый элемент массива photo
      const uploadedUrls = await Promise.all(item.photo.map(async (photoData) => {
        let fileBuffer;
        let contentType = 'application/octet-stream'; // Значение по умолчанию для неизвестного типа

        // Обработка в зависимости от формата (путь или base64)
        if (typeof photoData === 'string' && photoData.startsWith('data:')) {
          // Если приходит base64
          const base64Data = photoData.split(',')[1];
          fileBuffer = Buffer.from(base64Data, 'base64');
          contentType = photoData.match(/data:(image\/[a-zA-Z+-]+);/)?.[1] || 'application/octet-stream';
        } else {
          // Если приходит путь к файлу
          const fs = require('fs');
          const path = require('path');
          const filePath = path.resolve(__dirname, photoData);
          fileBuffer = fs.readFileSync(filePath);

          // Определение contentType по расширению файла
          const extension = path.extname(filePath).toLowerCase().slice(1);
          contentType = getContentTypeFromExtension(extension) || 'application/octet-stream';
        }

        // Генерация уникального имени файла с учетом расширения
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${contentType.split('/')[1]}`;

        // Загрузка в R2
        await bucket.upload(fileBuffer, fileName, { contentType });

        // Формирование публичного URL
        const publicUrl = `https://${process.env.CLOUDFLARE_BUCKET_NAME}.${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${fileName}`;

        return publicUrl;
      }));

      // Возвращаем новый объект с замененным массивом URL-адресов
      return {
        ...item,
        photo: uploadedUrls,
      };
    }));

    return processedImages;
  } catch (error) {
    console.error('Ошибка при загрузке изображений в Cloudflare:', error);
    throw new Error('Не удалось обработать изображения');
  }
}

/**
 * Функция для определения MIME-типа по расширению файла
 * @param {string} extension - Расширение файла (например, 'png', 'jpg')
 * @returns {string} - Соответствующий MIME-тип
 */
function getContentTypeFromExtension(extension) {
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'bmp': 'image/bmp',
    'tiff': 'image/tiff',
    'svg': 'image/svg+xml',
    // Добавьте другие типы по необходимости
  };

  return mimeTypes[extension] || 'application/octet-stream';
}

module.exports = { uploadImagesToCloudflare };