import fs from 'fs';

const dogsIndex = JSON.parse(fs.readFileSync('./data/v1/indexes/dogs-index.json', 'utf8'));

const map = new Map();
const toRemove = [];

dogsIndex.forEach(dog => {
  const key = dog.dog_key.toLowerCase();
  if (map.has(key)) {
    const existing = map.get(key);
    // Keep the one with more competitions, or the one with lower ID if equal
    if (dog.competition_count > existing.competition_count) {
      toRemove.push(existing.id);
      map.set(key, dog);
    } else {
      toRemove.push(dog.id);
    }
  } else {
    map.set(key, dog);
  }
});

const cleanedIndex = Array.from(map.values()).sort((a, b) => a.id - b.id);

console.log(`Original: ${dogsIndex.length} dogs`);
console.log(`Duplicates removed: ${toRemove.length}`);
console.log(`Cleaned: ${cleanedIndex.length} dogs`);
console.log(`Removed IDs: ${toRemove.join(', ')}`);

fs.writeFileSync('./data/v1/indexes/dogs-index.json', JSON.stringify(cleanedIndex, null, 2));
console.log('Updated dogs-index.json');
