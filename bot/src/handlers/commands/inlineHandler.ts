import { Composer } from 'grammy';
import type { CoursingStatsAPI } from '../../api';
import type { KVNamespace } from '../context';
import {
  buildDoninoNotFoundResult,
  buildInlineDogResult,
  buildInlineDoninoDogResults,
  buildInlineDoninoResults,
  collectDoninoBreeds,
  findDoninoDogsByName,
  matchDoninoBreeds,
  matchExactDoninoBreeds,
  parseDoninoDiscipline,
  parseDoninoInlineQuery,
} from '../../inlineQuery';
import { isDogFavorite } from '../utils/presentDogCard';

export function setupInlineQueryHandler(composer: Composer<any>, api: CoursingStatsAPI, cache?: KVNamespace) {
  composer.inlineQuery(/.*/, async (ctx) => {
    const { sanitizeInput, validateSearchQuery } = await import('../utils/validators');
    const query = sanitizeInput(ctx.inlineQuery.query);

    const inlineButton = {
      text: '🤖 Открыть бота',
      start_parameter: 'inline',
    };

    // Phrase shortcuts: донино / donino [курсинг|рейсинг|порода|кличка]
    const doninoQuery = parseDoninoInlineQuery(query);
    if (doninoQuery) {
      try {
        const records = await api.getSpeedRecords();
        const doninoButton = { text: '⏱ Донино в боте', start_parameter: 'donino' };

        if (doninoQuery.term) {
          const discipline = parseDoninoDiscipline(doninoQuery.term);
          const filterTerm = discipline?.rest ?? (discipline ? undefined : doninoQuery.term);

          if (discipline && !filterTerm) {
            const results = buildInlineDoninoResults(records.speed, records.coursing, {
              only: discipline.discipline,
            });
            await ctx.answerInlineQuery(results, { cache_time: 0, button: doninoButton });
            return;
          }

          const lookup = filterTerm ?? doninoQuery.term;
          const allBreeds = collectDoninoBreeds(records.speed, records.coursing);
          const exactBreeds = matchExactDoninoBreeds(lookup, allBreeds);
          const nameHits = findDoninoDogsByName(lookup, records.speed, records.coursing);
          const partialBreeds = matchDoninoBreeds(lookup, allBreeds);

          if (exactBreeds.length > 0) {
            const speed = records.speed.filter((r) => exactBreeds.includes(r.breed));
            const coursing = records.coursing.filter((r) => exactBreeds.includes(r.breed));
            const results = buildInlineDoninoResults(speed, coursing, {
              breedLabel: exactBreeds[0],
              siteBreeds: exactBreeds,
              only: discipline?.discipline,
            });
            await ctx.answerInlineQuery(results, { cache_time: 0, button: doninoButton });
            return;
          }

          if (nameHits.length > 0) {
            await ctx.answerInlineQuery(buildInlineDoninoDogResults(nameHits), {
              cache_time: 0,
              button: doninoButton,
            });
            return;
          }

          if (partialBreeds.length > 0) {
            const speed = records.speed.filter((r) => partialBreeds.includes(r.breed));
            const coursing = records.coursing.filter((r) => partialBreeds.includes(r.breed));
            const breedLabel = partialBreeds.length === 1 ? partialBreeds[0] : partialBreeds.join(', ');
            const results = buildInlineDoninoResults(speed, coursing, {
              breedLabel,
              siteBreeds: partialBreeds,
              only: discipline?.discipline,
            });
            await ctx.answerInlineQuery(results, { cache_time: 0, button: doninoButton });
            return;
          }

          await ctx.answerInlineQuery(buildDoninoNotFoundResult(doninoQuery.term), {
            cache_time: 0,
          });
          return;
        }

        const results = buildInlineDoninoResults(records.speed, records.coursing);
        await ctx.answerInlineQuery(results, {
          cache_time: 0,
          button: doninoButton,
        });
      } catch {
        await ctx.answerInlineQuery([], { cache_time: 0 });
      }
      return;
    }

    // Validate dog search query
    if (!validateSearchQuery(query)) {
      await ctx.answerInlineQuery([], { cache_time: 0 });
      return;
    }

    try {
      const dogs = await api.searchDogsByName(query, undefined, 5);

      if (!dogs || dogs.length === 0) {
        await ctx.answerInlineQuery([], { cache_time: 300 });
        return;
      }

      const userId = ctx.from?.id.toString();
      const results = (
        await Promise.all(
          dogs.map(async (dog) => {
            const dogData = await api.getDogById(dog.id.toString());
            if (!dogData) return null;
            const [shows, isFavorite] = await Promise.all([
              api.getShowSummaryForCompetitionDog(dogData.dog.id),
              isDogFavorite(cache, userId, dogData.dog.id),
            ]);
            return buildInlineDogResult(dogData, { shows, isFavorite });
          }),
        )
      ).filter((r): r is NonNullable<typeof r> => r != null);

      if (results.length === 0) {
        await ctx.answerInlineQuery([], { cache_time: 0 });
        return;
      }

      await ctx.answerInlineQuery(results, {
        cache_time: 60,
        button: inlineButton,
      });
    } catch (error) {
      await ctx.answerInlineQuery([], { cache_time: 0 });
    }
  });
}
