/** Флаг разработки, если равен 1, то используются короткие интервалы
 * если равен 0, то используются полные интервалы (60 и 90)
 */
const DEV: 0 | 1 = 0;

/** Количество секунд для перерыва между подходами */
export const REPEATS_BREAK_TIME = DEV === 1 ? 1 : 60;

/** Количество секунд для перерыва между упражнениями */
export const EXERCISES_BREAK_TIME = DEV === 1 ? 2 : 90;
export const ONE_SECOND = 1000;
export const ALARM_SOUND_FILEPATH = 'beep-6.mp3';
