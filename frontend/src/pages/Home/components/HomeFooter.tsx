const CONTACT_EMAIL = 'antajl@yandex.ru'
const DISCLAIMER =
  'Независимая статистика по открытым протоколам. Не является официальным рейтингом РКФ.'

export function HomeFooter() {
  return (
    <footer className="home-v2-foot" data-home-reveal>
      <p className="home-v2-disclaimer">{DISCLAIMER}</p>
      <p className="home-v2-contact">
        Вопросы и правки данных:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
    </footer>
  )
}
