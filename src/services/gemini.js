const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const PROMPT = `You are Vanya, an expert wildlife AI for the SnapWild app (India-focused).

Analyze the image carefully. If you see an animal, return ONLY a valid JSON object (no markdown, no explanation):
{
  "found": true,
  "name": "Common Name",
  "scientific": "Scientific Name",
  "habitat": "One-sentence habitat description",
  "conservation": "Least Concern",
  "rarity": "Common",
  "xp": 15,
  "facts": ["fact1", "fact2", "fact3"],
  "dangerous": false,
  "dangerNote": null
}

Rarity rules:
- "Legendary" (xp:150) → Critically Endangered on IUCN Red List
- "Rare" (xp:100) → Endangered or Vulnerable on IUCN
- "Uncommon" (xp:45) → Near Threatened on IUCN
- "Common" (xp:15) → Least Concern or Data Deficient

Make facts fascinating, specific to India where possible.
If dangerous, set dangerous:true and dangerNote to a one-line safety tip.
If no animal is visible, return: {"found": false}
Return JSON only. No markdown code blocks.`;

const RARITY_XP = { Common: 15, Uncommon: 45, Rare: 100, Legendary: 150 };

const demoResult = () => ({
  found: true,
  name: 'Indian Peacock',
  scientific: 'Pavo cristatus',
  habitat: 'Forests, grasslands and farmland across the Indian subcontinent',
  conservation: 'Least Concern',
  rarity: 'Common',
  xp: 15,
  facts: [
    "India's national bird — chosen for its beauty and cultural significance across millennia.",
    'Only the male peacock has the iconic colorful train; females (peahens) are brown and unadorned.',
    'Despite the enormous tail, peacocks can fly and reach speeds of 16 km/h.',
  ],
  dangerous: false,
  dangerNote: null,
  isDemo: true,
});

export async function getCompatibility(pet1, pet2) {
  if (!API_KEY) return _fallbackCompat(pet1, pet2);

  const prompt = `You are a pet compatibility expert. Analyse these two pets and return ONLY a valid JSON object (no markdown):
{
  "score": 85,
  "summary": "One sentence on why they match or don't",
  "tips": ["Tip 1 for a safe first meeting", "Tip 2"]
}

Pet A: ${pet1.name}, ${pet1.species} (${pet1.breed}), age ${pet1.age} years, temperament: ${pet1.temperament.join(', ')}
Pet B: ${pet2.name}, ${pet2.species} (${pet2.breed}), age ${pet2.age} years, temperament: ${pet2.temperament.join(', ')}

Score 0–100 based on energy match, temperament overlap, and species compatibility. Return JSON only.`;

  try {
    const res = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 256 },
      }),
    });
    if (!res.ok) return _fallbackCompat(pet1, pet2);
    const json    = await res.json();
    const raw     = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return _fallbackCompat(pet1, pet2);
  }
}

function _fallbackCompat(pet1, pet2) {
  const shared = pet1.temperament.filter(t => pet2.temperament.includes(t)).length;
  const total  = new Set([...pet1.temperament, ...pet2.temperament]).size;
  const base   = Math.round(40 + (shared / Math.max(total, 1)) * 45);
  const bonus  = pet1.species === pet2.species ? 10 : 0;
  const score  = Math.min(base + bonus, 95);
  return {
    score,
    summary: `${pet1.name} and ${pet2.name} share ${shared} personality trait${shared !== 1 ? 's' : ''} in common.`,
    tips: ['Meet in a neutral, open area like a park', 'Keep both pets on leash for the first 10 minutes'],
  };
}

export async function identifyAnimal(base64Image) {
  if (!API_KEY) {
    await new Promise(r => setTimeout(r, 1200));
    return demoResult();
  }

  try {
    const res = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: PROMPT },
            { inline_data: { mime_type: 'image/jpeg', data: base64Image } },
          ],
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
      }),
    });

    if (!res.ok) {
      console.warn(`Gemini ${res.status} — falling back to demo`);
      return demoResult();
    }

    const json    = await res.json();
    const raw     = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const data    = JSON.parse(cleaned);

    if (!data.found) return { found: false };

    data.xp = RARITY_XP[data.rarity] ?? 15;
    return data;

  } catch (err) {
    console.warn('Gemini error — falling back to demo:', err.message);
    return demoResult();
  }
}
