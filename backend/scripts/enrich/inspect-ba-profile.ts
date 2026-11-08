import { fetch } from 'undici'

async function inspect(url: string) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
  })
  const html = await res.text()

  const match = html.match(/animal:\s*JSON\.parse\("([\s\S]*?)"\)\s*,\s*\n/)
  if (match) {
    const raw = JSON.parse(`"${match[1]}"`)
    const animal = JSON.parse(raw)
    console.log('\n=== Breed Archive Details for:', animal.registeredName, '===')
    console.log('Sex:', animal.sex === 1 ? 'M (Кобель)' : animal.sex === 2 ? 'F (Сука)' : 'Не указан')
    console.log('Date of Birth:', animal.dateOfBirth || 'Не указана')
    console.log('Color & Marking:', [animal.color, animal.colorMarking].filter(Boolean).join(', ') || 'Не указан')
    console.log('Variety / Coat:', animal.variety || 'Стандарт')
    console.log('Country of Birth:', animal.landOfBirth || 'Не указана')
    console.log('Kennel:', animal.kennel || 'Не указан')
    console.log('COI (Инбридинг):', animal.coi ? `${animal.coi}%` : 'Не рассчитан')
    console.log('Sire (Отец):', animal.sire ? `${animal.sire.registeredName} (${animal.sire.landOfBirth || '?'}, р. ${animal.sire.yearOfBirth || '?'})` : 'Нет данных')
    console.log('Dam (Мать):', animal.dam ? `${animal.dam.registeredName} (${animal.dam.landOfBirth || '?'}, р. ${animal.dam.yearOfBirth || '?'})` : 'Нет данных')
  }

  // Check photos
  const photoMatch = html.match(/photos:\s*JSON\.parse\("([\s\S]*?)"\)\s*,\s*\n/)
  if (photoMatch) {
    const raw = JSON.parse(`"${photoMatch[1]}"`)
    const photos = JSON.parse(raw)
    console.log('Photos count:', photos.length)
    if (photos.length > 0) {
      console.log('First photo:', photos[0].image, `by ${photos[0].copyright}`)
    }
  }

  // Check breeders
  const breederMatch = html.match(/breeders:\s*JSON\.parse\("([\s\S]*?)"\)\s*,\s*\n/)
  if (breederMatch) {
    const raw = JSON.parse(`"${breederMatch[1]}"`)
    const breeders = JSON.parse(raw)
    console.log('Breeders:', breeders.map((b: any) => b.name).join(', ') || 'Не указаны')
  }

  // Check owners
  const ownerMatch = html.match(/owners:\s*JSON\.parse\("([\s\S]*?)"\)\s*,\s*\n/)
  if (ownerMatch) {
    const raw = JSON.parse(`"${ownerMatch[1]}"`)
    const owners = JSON.parse(raw)
    console.log('Owners:', owners.map((o: any) => o.name).join(', ') || 'Не указаны')
  }

  // Check health screenings
  const healthMatch = html.match(/animalHealthinfos:\s*JSON\.parse\("([\s\S]*?)"\)\s*,\s*\n/)
  if (healthMatch) {
    const raw = JSON.parse(`"${healthMatch[1]}"`)
    const health = JSON.parse(raw)
    console.log('Health records:', health.length)
  }
}

async function run() {
  await inspect('https://whippet.breedarchive.com/animal/view/intrigas-faberge-5b372bc4-c717-4b44-ad2e-7aabe772a51f')
  await inspect('https://saluki.breedarchive.com/animal/view/alansaris-mashtan-fa863057-7c32-4446-99d4-729d0899ad26')
}

run().catch(console.error)
