const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL   = 'google/gemini-2.0-flash-001';

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

export async function identifyAnimal(base64Image) {
  if (!API_KEY) {
    await new Promise(r => setTimeout(r, 1200));
    return demoResult();
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': 'https://snapwild.in',
        'X-Title': 'SnapWild',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: PROMPT },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${base64Image}` },
            },
          ],
        }],
        temperature: 0.1,
        max_tokens: 1024,
      }),
    });

    if (!res.ok) {
      console.warn(`OpenRouter ${res.status} — falling back to demo`);
      return demoResult();
    }

    const json    = await res.json();
    const raw     = json.choices?.[0]?.message?.content ?? '';
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const data    = JSON.parse(cleaned);

    if (!data.found) return { found: false };

    data.xp = RARITY_XP[data.rarity] ?? 15;
    return data;

  } catch (err) {
    console.warn('OpenRouter error — falling back to demo:', err.message);
    return demoResult();
  }
}
