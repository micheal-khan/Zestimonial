import Anthropic from '@anthropic-ai/sdk';
import type { SupabaseClient } from '@supabase/supabase-js';
import { testimonialTags, type TestimonialTag } from '@/lib/widgets';

const SYSTEM_PROMPT = `You help freelancers and small studios showcase client testimonials.

Given one testimonial, return:
- "highlight": the single most persuasive sentence or phrase from the testimonial, copied exactly as written (same words, spelling, and punctuation; you may drop leading or trailing words to make it self-contained). Aim for 8 to 25 words. Never paraphrase, correct, or add words, because the client must be quoted accurately. If the testimonial is already short, return it whole.
- "tags": one to three topics the client actually praises, chosen only from the allowed list.`;

const outputSchema = {
  type: 'object',
  properties: {
    highlight: { type: 'string' },
    tags: { type: 'array', items: { type: 'string', enum: [...testimonialTags] } },
  },
  required: ['highlight', 'tags'],
  additionalProperties: false,
};

export function isAiConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const normalize = (text: string) => text.replace(/\s+/g, ' ').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").trim().toLowerCase();

/** Asks Claude for a verbatim highlight and topic tags. The highlight is dropped if it isn't really in the quote. */
export async function analyzeTestimonial(input: { quote: string; authorRole: string }) {
  const client = new Anthropic();
  const response = await client.beta.messages.create({
    model: 'claude-opus-5',
    max_tokens: 2000,
    thinking: { type: 'adaptive' },
    output_config: { effort: 'low', format: { type: 'json_schema', schema: outputSchema } },
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: `Client role: ${input.authorRole}\n\n<testimonial>\n${input.quote}\n</testimonial>` }],
  });
  if (response.stop_reason === 'refusal') return null;
  const text = response.content.find((block) => block.type === 'text')?.text;
  if (!text) return null;
  const parsed = JSON.parse(text) as { highlight: string; tags: string[] };
  const highlight = parsed.highlight.trim().replace(/^["“]|["”]$/g, '');
  return {
    highlight: highlight && normalize(input.quote).includes(normalize(highlight)) ? highlight : null,
    tags: [...new Set(parsed.tags.filter((tag): tag is TestimonialTag => (testimonialTags as readonly string[]).includes(tag)))].slice(0, 3),
  };
}

/** Analyzes a stored testimonial and saves the result. Returns the saved fields, or null if AI isn't available. */
export async function analyzeAndSave(admin: SupabaseClient, testimonial: { id: string; quote: string; author_role: string }) {
  if (!isAiConfigured()) return null;
  const result = await analyzeTestimonial({ quote: testimonial.quote, authorRole: testimonial.author_role });
  if (!result) return null;
  const saved = { highlight: result.highlight, tags: result.tags, ai_processed_at: new Date().toISOString() };
  const update = await admin.from('testimonials').update(saved).eq('id', testimonial.id);
  if (update.error) throw update.error;
  return saved;
}
