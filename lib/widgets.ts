export const widgetLayouts = ['carousel', 'grid', 'masonry', 'marquee', 'single', 'badge'] as const;
export type WidgetLayout = (typeof widgetLayouts)[number];

export const testimonialTags = ['results', 'communication', 'speed', 'quality', 'expertise', 'value', 'creativity', 'reliability', 'support', 'process'] as const;
export type TestimonialTag = (typeof testimonialTags)[number];

export type WidgetSettings = {
  name: string;
  layout: WidgetLayout;
  theme: 'light' | 'dark';
  accent_color: string | null;
  show_rating: boolean;
  show_role: boolean;
  use_highlight: boolean;
  max_items: number;
  corner_radius: number;
  tag_filter: string | null;
  is_published: boolean;
};

export type Widget = WidgetSettings & { id: string; created_at: string };

export type PublicTestimonial = { id: string; author_name: string; author_role: string; quote: string; highlight: string | null; rating: number; tags: string[] };

export const widgetColumns = 'id,name,layout,theme,accent_color,show_rating,show_role,use_highlight,max_items,corner_radius,tag_filter,is_published,created_at';

export const defaultWidgetSettings: WidgetSettings = {
  name: 'My testimonial widget',
  layout: 'carousel',
  theme: 'light',
  accent_color: null,
  show_rating: true,
  show_role: true,
  use_highlight: false,
  max_items: 12,
  corner_radius: 16,
  tag_filter: null,
  is_published: true,
};

/** Validates untrusted widget input, keeping only known fields with valid values. */
export function parseWidgetSettings(body: Record<string, unknown>): Partial<WidgetSettings> {
  const settings: Partial<WidgetSettings> = {};
  if (typeof body.name === 'string' && body.name.trim()) settings.name = body.name.trim().slice(0, 80);
  if (typeof body.layout === 'string' && (widgetLayouts as readonly string[]).includes(body.layout)) settings.layout = body.layout as WidgetLayout;
  if (body.theme === 'light' || body.theme === 'dark') settings.theme = body.theme;
  if (body.accent_color === null || body.accent_color === '') settings.accent_color = null;
  else if (typeof body.accent_color === 'string' && /^#[0-9a-f]{6}$/i.test(body.accent_color)) settings.accent_color = body.accent_color;
  for (const key of ['show_rating', 'show_role', 'use_highlight', 'is_published'] as const) if (typeof body[key] === 'boolean') settings[key] = body[key];
  if (typeof body.max_items === 'number') settings.max_items = Math.min(50, Math.max(1, Math.round(body.max_items)));
  if (typeof body.corner_radius === 'number') settings.corner_radius = Math.min(32, Math.max(0, Math.round(body.corner_radius)));
  if (body.tag_filter === null || body.tag_filter === '') settings.tag_filter = null;
  else if (typeof body.tag_filter === 'string' && (testimonialTags as readonly string[]).includes(body.tag_filter)) settings.tag_filter = body.tag_filter;
  return settings;
}

/** Applies a widget's tag filter and item limit to approved testimonials (newest first). */
export function selectWidgetTestimonials(rows: PublicTestimonial[], settings: Pick<WidgetSettings, 'tag_filter' | 'max_items'>) {
  const filtered = settings.tag_filter ? rows.filter((row) => row.tags.includes(settings.tag_filter!)) : rows;
  return filtered.slice(0, settings.max_items);
}
