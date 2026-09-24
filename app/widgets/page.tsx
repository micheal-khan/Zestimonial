'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Code2, Copy, ExternalLink, Heart, Plus, Save, Trash2 } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';
import { TestimonialWidget } from '@/components/testimonial-widget';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { defaultWidgetSettings, selectWidgetTestimonials, testimonialTags, widgetLayouts, type PublicTestimonial, type Widget, type WidgetSettings } from '@/lib/widgets';

const layoutLabels: Record<WidgetSettings['layout'], string> = { carousel: 'Carousel', grid: 'Grid', masonry: 'Masonry wall', marquee: 'Scrolling marquee', single: 'Single card', badge: 'Rating badge' };

export default function WidgetsPage() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<WidgetSettings>(defaultWidgetSettings);
  const [testimonials, setTestimonials] = useState<PublicTestimonial[]>([]);
  const [workspace, setWorkspace] = useState<{ slug: string; brand_color: string } | null>(null);
  const [embedMode, setEmbedMode] = useState<'script' | 'iframe'>('script');
  const [copied, setCopied] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  function select(widget: Widget | null) {
    setSelectedId(widget?.id ?? null);
    setMessage('');
    if (!widget) { setDraft(defaultWidgetSettings); return; }
    const { id: _id, created_at: _created, ...settings } = widget;
    setDraft(settings);
  }

  useEffect(() => {
    void Promise.all([fetch('/api/widgets'), fetch('/api/testimonials')]).then(async ([widgetResponse, testimonialResponse]) => {
      if (widgetResponse.status === 401) { window.location.href = '/login'; return; }
      const widgetData = await widgetResponse.json() as { widgets?: Widget[]; workspace?: { slug: string; brand_color: string }; error?: string };
      const testimonialData = await testimonialResponse.json() as { testimonials?: (PublicTestimonial & { status: string; consent: boolean })[] };
      if (!widgetResponse.ok) { setMessage(widgetData.error || 'Unable to load widgets.'); return; }
      setWidgets(widgetData.widgets || []);
      setWorkspace(widgetData.workspace || null);
      setTestimonials((testimonialData.testimonials || []).filter((t) => t.status === 'approved' && t.consent).map((t) => ({ ...t, tags: t.tags || [] })));
      const first = widgetData.widgets?.[0];
      if (first) select(first);
    }).catch(() => setMessage('Unable to load widgets.'));
  }, []);

  const selected = widgets.find((w) => w.id === selectedId) || null;
  const dirty = useMemo(() => !selected || (Object.keys(draft) as (keyof WidgetSettings)[]).some((key) => draft[key] !== selected[key]), [draft, selected]);
  const preview = selectWidgetTestimonials(testimonials, draft);
  // Only read once data has loaded (client-side), so server and client renders match.
  const origin = workspace ? window.location.origin : '';

  function update<K extends keyof WidgetSettings>(key: K, value: WidgetSettings[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    setSaving(true); setMessage('');
    const response = await fetch(selected ? `/api/widgets/${selected.id}` : '/api/widgets', { method: selected ? 'PATCH' : 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(draft) });
    const result = await response.json() as { widget?: Widget; error?: string };
    setSaving(false);
    if (!response.ok || !result.widget) { setMessage(result.error || 'Unable to save widget.'); return; }
    const saved = result.widget;
    setWidgets((current) => selected ? current.map((w) => w.id === saved.id ? saved : w) : [saved, ...current]);
    select(saved);
    setMessage(selected ? 'Widget saved. Live embeds update within a minute.' : 'Widget created. Copy the embed code below.');
  }

  async function remove() {
    if (!selected || !window.confirm(`Delete “${selected.name}”? Sites embedding it will stop showing testimonials.`)) return;
    const response = await fetch(`/api/widgets/${selected.id}`, { method: 'DELETE' });
    if (!response.ok) { setMessage('Unable to delete widget.'); return; }
    const rest = widgets.filter((w) => w.id !== selected.id);
    setWidgets(rest);
    select(rest[0] || null);
  }

  async function copy(key: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    window.setTimeout(() => setCopied(''), 1500);
  }

  const embedCode = selected ? embedMode === 'script'
    ? `<script src="${origin}/embed.js" data-zestimonial-widget="${selected.id}" async></script>`
    : `<iframe src="${origin}/embed/${selected.id}" style="width:100%;height:420px;border:0" loading="lazy" title="Client testimonials"></iframe>` : '';
  const wallUrl = workspace ? `${origin}/love/${workspace.slug}` : '';

  return (
    <DashboardShell active="Widgets" title="Widgets" description="Design how your approved testimonials appear on your website." actions={<Button onClick={() => select(null)} className="bg-[var(--ink)]"><Plus />New widget</Button>}>
      <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="space-y-3">
          {widgets.map((w) => (
            <button key={w.id} onClick={() => select(w)} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${w.id === selectedId ? 'border-[var(--ink)] bg-white shadow-sm' : 'border-[var(--line)] bg-white/60 hover:bg-white'}`}>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#edf2eb]"><Code2 className="h-4 w-4" /></span>
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{w.name}</span><span className="block text-xs text-muted-foreground">{layoutLabels[w.layout]} · {w.is_published ? 'Live' : 'Hidden'}</span></span>
            </button>
          ))}
          {!selectedId && <div className="rounded-2xl border border-dashed border-[var(--ink)] bg-white p-3 text-sm font-bold">New widget (unsaved)</div>}
          {workspace && (
            <div className="rounded-2xl bg-[var(--ink)] p-4 text-white">
              <Heart className="h-5 w-5 text-[#d9f75b]" fill="currentColor" />
              <p className="mt-3 font-bold">Wall of Love</p>
              <p className="mt-1 text-xs leading-5 text-white/65">A public page with all your approved testimonials. No code needed.</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={() => copy('wall', wallUrl)} className="bg-[#d9f75b] text-[#24312b] hover:bg-[#e2ff71]">{copied === 'wall' ? <Check /> : <Copy />}{copied === 'wall' ? 'Copied' : 'Copy link'}</Button>
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={() => window.open(wallUrl, '_blank')}><ExternalLink />Open</Button>
              </div>
            </div>
          )}
        </aside>

        <div className="grid gap-6 2xl:grid-cols-[340px_minmax(0,1fr)]">
          <section className="h-fit space-y-5 rounded-[22px] border border-[var(--line)] bg-white p-6">
            <label htmlFor="widgetName" className="grid gap-2 text-sm font-bold">Widget name<Input id="widgetName" value={draft.name} onChange={(e) => update('name', e.target.value)} className="h-11" placeholder="Portfolio praise" /></label>
            <label htmlFor="widgetLayout" className="grid gap-2 text-sm font-bold">Layout
              <NativeSelect id="widgetLayout" value={draft.layout} onChange={(e) => update('layout', e.target.value as WidgetSettings['layout'])} className="w-full">{widgetLayouts.map((l) => <NativeSelectOption key={l} value={l}>{layoutLabels[l]}</NativeSelectOption>)}</NativeSelect>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label htmlFor="widgetTheme" className="grid gap-2 text-sm font-bold">Theme
                <NativeSelect id="widgetTheme" value={draft.theme} onChange={(e) => update('theme', e.target.value as WidgetSettings['theme'])} className="w-full"><NativeSelectOption value="light">Light</NativeSelectOption><NativeSelectOption value="dark">Dark</NativeSelectOption></NativeSelect>
              </label>
              <label htmlFor="widgetAccent" className="grid gap-2 text-sm font-bold">Accent
                <div className="flex gap-2"><Input id="widgetAccent" type="color" value={draft.accent_color || workspace?.brand_color || '#d9f75b'} onChange={(e) => update('accent_color', e.target.value)} className="h-9 w-12 p-1" />{draft.accent_color && <Button type="button" size="sm" variant="ghost" onClick={() => update('accent_color', null)}>Brand</Button>}</div>
              </label>
            </div>
            <label htmlFor="widgetTag" className="grid gap-2 text-sm font-bold">Only show testimonials tagged
              <NativeSelect id="widgetTag" value={draft.tag_filter || ''} onChange={(e) => update('tag_filter', e.target.value || null)} className="w-full"><NativeSelectOption value="">Any topic</NativeSelectOption>{testimonialTags.map((t) => <NativeSelectOption key={t} value={t}>{t}</NativeSelectOption>)}</NativeSelect>
            </label>
            <label htmlFor="widgetMax" className="grid gap-2 text-sm font-bold">Show up to {draft.max_items} testimonials<input id="widgetMax" type="range" min={1} max={50} value={draft.max_items} onChange={(e) => update('max_items', Number(e.target.value))} className="accent-[var(--ink)]" /></label>
            <label htmlFor="widgetRadius" className="grid gap-2 text-sm font-bold">Corner roundness<input id="widgetRadius" type="range" min={0} max={32} value={draft.corner_radius} onChange={(e) => update('corner_radius', Number(e.target.value))} className="accent-[var(--ink)]" /></label>
            <div className="space-y-3 border-t border-[var(--line)] pt-5">
              <Toggle label="Show star rating" checked={draft.show_rating} onChange={(v) => update('show_rating', v)} />
              <Toggle label="Show role and company" checked={draft.show_role} onChange={(v) => update('show_role', v)} />
              <Toggle label="Use AI highlight instead of full quote" checked={draft.use_highlight} onChange={(v) => update('use_highlight', v)} />
              <Toggle label="Published" checked={draft.is_published} onChange={(v) => update('is_published', v)} />
            </div>
            {message && <output className="block rounded-xl bg-[#eef3e8] p-3 text-sm text-[#506043]">{message}</output>}
            <div className="flex gap-2">
              <Button onClick={save} disabled={saving || !dirty || !draft.name.trim()} className="flex-1 bg-[var(--ink)]"><Save />{saving ? 'Saving…' : selected ? 'Save changes' : 'Create widget'}</Button>
              {selected && <Button variant="outline" onClick={remove} aria-label="Delete widget"><Trash2 /></Button>}
            </div>
          </section>

          <section className="min-w-0 space-y-4">
            <div className="rounded-[22px] border border-[var(--line)] bg-[repeating-conic-gradient(#f3f5f1_0%_25%,#fafbf9_0%_50%)] bg-[length:24px_24px] p-4 md:p-6">
              <p className="mb-4 text-xs font-bold text-muted-foreground">LIVE PREVIEW · {preview.length} of {testimonials.length} approved</p>
              <div className={`rounded-2xl p-4 ${draft.theme === 'dark' ? 'bg-[#18231e]' : 'bg-transparent'}`}>
                <TestimonialWidget settings={draft} testimonials={preview} brandColor={workspace?.brand_color} />
              </div>
            </div>
            {selected ? (
              <div className="rounded-[22px] border border-[var(--line)] bg-white p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="mr-auto font-bold">Embed on your site</h2>
                  {(['script', 'iframe'] as const).map((mode) => <Button key={mode} size="sm" variant={embedMode === mode ? 'default' : 'outline'} onClick={() => setEmbedMode(mode)}>{mode === 'script' ? 'Auto-resizing script' : 'Plain iframe'}</Button>)}
                </div>
                <pre className="mt-4 overflow-x-auto rounded-xl bg-[#f5f7f3] p-4 text-xs leading-5"><code>{embedCode}</code></pre>
                <p className="mt-3 text-xs text-muted-foreground">Works in WordPress (Custom HTML block), Webflow (Embed element), Framer (Embed component), Squarespace (Code block) and Shopify (Custom Liquid section).</p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => copy('embed', embedCode)}>{copied === 'embed' ? <Check /> : <Copy />}{copied === 'embed' ? 'Copied' : 'Copy code'}</Button>
                  <Button size="sm" variant="ghost" onClick={() => window.open(`/embed/${selected.id}`, '_blank')} disabled={!selected.is_published}><ExternalLink />Open live widget</Button>
                </div>
                {dirty && <p className="mt-3 text-xs font-bold text-[#8a5a00]">You have unsaved changes. The live widget shows the last saved version.</p>}
              </div>
            ) : <p className="rounded-[22px] border border-dashed border-[var(--line)] bg-white p-5 text-sm text-muted-foreground">Create the widget to get its embed code.</p>}
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <div className="flex items-center justify-between gap-3 text-sm font-medium">{label}<Switch aria-label={label} checked={checked} onCheckedChange={(value) => onChange(value)} /></div>;
}
