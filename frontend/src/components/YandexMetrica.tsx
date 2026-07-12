import { Helmet } from 'react-helmet-async'

// Яндекс.Метрика код счетчика
// Номер счётчика: 110619327
// Настройки: Вебвизор, карта скроллинга, точные отскоки, отслеживание ссылок
const YANDEX_METRICA_ID = 110619327

export function YandexMetrica() {
  return (
    <Helmet>
      {/* Яндекс.Метрика */}
      <script type="text/javascript">
        {`
          (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=110619327', 'ym');

          ym(${YANDEX_METRICA_ID}, 'init', {
            ssr: true,
            webvisor: true,
            clickmap: true,
            accurateTrackBounce: true,
            trackLinks: true
          });
        `}
      </script>
      <noscript>
        {`<div><img src="https://mc.yandex.ru/watch/${YANDEX_METRICA_ID}" style="position:absolute; left:-9999px;" alt="" /></div>`}
      </noscript>
    </Helmet>
  )
}

// Хук для отслеживания целей Яндекс.Метрики
export function useYandexGoal() {
  const reachGoal = (goalName: string) => {
    if (typeof window !== 'undefined' && window.ym) {
      window.ym(YANDEX_METRICA_ID, 'reachGoal', goalName)
    }
  }

  return { reachGoal }
}

// Имена целей для использования в компонентах:
// 'dog_profile_view' - просмотр профиля собаки
// 'search_used' - использование поиска
// 'filter_used' - использование фильтров
// 'procoursing_link' - переход на procoursing.ru
// 'competition_view' - просмотр соревнования
// 'speed_records_view' - просмотр рекордов скорости
// 'judges_view' - просмотр судей
// 'guide_view' - просмотр справочника
