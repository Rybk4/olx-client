import { formatDistanceToNowStrict, differenceInDays, format, Locale } from 'date-fns';
import { ru } from 'date-fns/locale'; // Импорт русской локали

interface FormatDateOptions {
    addSuffix?: boolean;
    locale?: Locale;
}

export const formatDateRelative = (dateString: string | Date): string => {
    const date = new Date(dateString);
    const now = new Date();

    const daysDifference = differenceInDays(now, date);

    try {
        if (daysDifference < 1) {
            // Менее одного дня назад
            const distance = formatDistanceToNowStrict(date, { addSuffix: true, locale: ru });
            // formatDistanceToNowStrict может вернуть "0 секунд назад", можно обработать
            if (distance.includes('секунд') || distance.includes('минуту назад') && !distance.includes('минут')) { // "минуту назад"
                 // если прошло меньше минуты или ровно 1 минута, покажем "только что" или "1 минуту назад"
                if (Math.abs(now.getTime() - date.getTime()) < 60000) { // меньше минуты
                    return 'только что';
                }
            }
            return distance;
        } else if (daysDifference < 2) { // Если прошло от 1 до 6 дней
             // Для "1 день назад", "2 дня назад" и т.д.
            return formatDistanceToNowStrict(date, { addSuffix: true, locale: ru, unit: 'day' });
        }
        else {
            // Более или равно 7 дней назад (или в будущем, если такое возможно)
            // Форматируем как "15 мая" или "15 мая 2023" если год не текущий
            const currentYear = now.getFullYear();
            const dateYear = date.getFullYear();

            if (currentYear === dateYear) {
                return format(date, 'd MMMM', { locale: ru }); // "15 мая"
            } else {
                return format(date, 'd MMMM yyyy', { locale: ru }); // "15 мая 2023"
            }
        }
    } catch (error) {
        console.error("Error formatting date:", error);
        // Возвращаем исходную строку или стандартный формат в случае ошибки
        return new Date(dateString).toLocaleDateString();
    }
};