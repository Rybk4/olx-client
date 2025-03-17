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
 * @param {Array<Object>} imageArray - Массив объектов с полем photo (массив объектов файлов от multer)
 * @returns {Promise<Array<Object>>} - Массив с замененными ссылками в поле photo
 */
async function uploadImagesToCloudflare(imageArray) {
  try {
    const processedImages = await Promise.all(imageArray.map(async (item) => {
      // Пропускаем, если нет поля photo или оно пустое
      if (!item.photo || !Array.isArray(item.photo) || item.photo.length === 0) {
        return item;
      }

      // Обрабатываем каждый элемент массива photo (объекты файлов от multer)
      const uploadedUrls = await Promise.all(item.photo.map(async (file) => {
        let fileBuffer = file.buffer; // Буфер файла из multer
        let contentType = file.mimetype || 'application/octet-stream'; // MIME-тип из файла

        if (!fileBuffer) {
          console.warn(`Пропущен недействительный файл: ${file.originalname}`);
          return null;
        }

        // Генерация уникального имени файла с учетом оригинального расширения
        const extension = contentType.split('/')[1] || 'bin';
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${extension}`;

        // Загрузка в R2
        await bucket.upload(fileBuffer, fileName, { contentType });

        // Формирование публичного URL
        const publicUrl = `https://${process.env.CLOUDFLARE_BUCKET_NAME}.${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${fileName}`;

        return publicUrl;
      }).filter(url => url !== null)); // Фильтруем null-значения

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

module.exports = { uploadImagesToCloudflare };