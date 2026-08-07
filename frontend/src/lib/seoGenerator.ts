/**
 * Клиент для генерации SEO-описаний через Workers AI
 */

interface GenerateDescriptionRequest {
  type: 'dog' | 'breed' | 'event' | 'page'
  data: {
    name?: string
    breed?: string
    stats?: string
    achievements?: string
    location?: string
    date?: string
    context?: string
  }
  lang?: 'ru' | 'en'
}

interface GenerateDescriptionResponse {
  success: boolean
  description?: string
  keywords?: string[]
  error?: string
}

const SEO_GENERATOR_URL = 'https://seo-generator.coursing-stats.ru'

/**
 * Генерирует SEO-оптимизированное описание
 */
export async function generateSEODescription(
  request: GenerateDescriptionRequest
): Promise<GenerateDescriptionResponse> {
  try {
    const response = await fetch(SEO_GENERATOR_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('SEO generation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Генерирует описание для профиля собаки
 */
export async function generateDogDescription(
  name: string,
  breed: string,
  stats?: string,
  achievements?: string,
  lang: 'ru' | 'en' = 'ru'
): Promise<GenerateDescriptionResponse> {
  return generateSEODescription({
    type: 'dog',
    data: { name, breed, stats, achievements },
    lang,
  })
}

/**
 * Генерирует описание для породы
 */
export async function generateBreedDescription(
  breed: string,
  context?: string,
  lang: 'ru' | 'en' = 'ru'
): Promise<GenerateDescriptionResponse> {
  return generateSEODescription({
    type: 'breed',
    data: { breed, context },
    lang,
  })
}

/**
 * Генерирует описание для соревнования
 */
export async function generateEventDescription(
  location: string,
  date?: string,
  context?: string,
  lang: 'ru' | 'en' = 'ru'
): Promise<GenerateDescriptionResponse> {
  return generateSEODescription({
    type: 'event',
    data: { location, date, context },
    lang,
  })
}

/**
 * Генерирует описание для страницы
 */
export async function generatePageDescription(
  context: string,
  lang: 'ru' | 'en' = 'ru'
): Promise<GenerateDescriptionResponse> {
  return generateSEODescription({
    type: 'page',
    data: { context },
    lang,
  })
}