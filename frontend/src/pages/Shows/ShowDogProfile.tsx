/**
 * Профиль выставочной собаки без связи с procoursing.
 * Тот же UI, что `/dog/:id`: три колонки (пустые курсинг/беги + выставки).
 * Если есть competition_dog_id — DogProfile редиректит на `/dog/:id`.
 */
export { default } from '../DogProfile'
