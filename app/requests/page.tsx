'use client';

import { useEffect, useState } from 'react';
import { BellRing, Check, Copy, Link2, Send } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Row = { id: string; client_name: string; client_email: string | null; project_name: string | null; status: 'draft' | 'sent' | 'viewed' | 'completed'; created_at: string; last_sent_at: string | null; reminder_count: number };

export default function RequestsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [slug, setSlug] = useState('');
  const [copied, setCopied] = useState('');
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/requests').then(async (response) => {
      if (response.status === 401) { window.location.href = '/login'; return; }
      const data = await response.json() as { requests?: Row[]; formSlug?: string; error?: string };
      if (!response.ok) { setMessage(data.error || 'Unable to load requests.'); return; }
      setRows(data.requests || []);
      setSlug(data.formSlug || '');
    }).catch(() => setMessage('Unable to load requests.'));
  }, []);

  async function complete(id: string) {
    const response = await fetch(`/api/requests/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: 'completed' }) });
    if (response.ok) setRows((current) => current.map((row) => row.id === id ? { ...row, status: 'completed' } : row));
  }

  async function remind(row: Row) {
    setBusy(row.id); setMessage('');
    const response = await fetch(`/api/requests/${row.id}/remind`, { method: 'POST' });
    const data = await response.json() as { request?: Row; error?: string };
    setBusy('');
    if (!response.ok || !data.request) { setMessage(data.error || 'Unable to send reminder.'); return; }
    const updated = data.request;
    setRows((current) => current.map((r) => r.id === row.id ? updated : r));
    setMessage(`Reminder sent to ${row.client_name}.`);
  }

  async function copy(key: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    window.setTimeout(() => setCopied(''), 1500);
  }

  const collectionUrl = (id?: string) => `${window.location.origin}/collect/${slug}${id ? `?request=${id}` : ''}`;

  return (
    <DashboardShell active="Requests" title="Client requests" description="Track who received your invitation and who has replied. Open requests get automatic reminders after 3 and 7 days." actions={<Button onClick={() => copy('general', collectionUrl())} variant="outline"><Copy />{copied === 'general' ? 'Copied' : 'Copy collection link'}</Button>}>
      {message && <output className="mb-4 block rounded-xl bg-[#eef3e8] p-3 text-sm text-[#506043]">{message}</output>}
      <div className="overflow-hidden rounded-[22px] border border-[var(--line)] bg-white">
        <div className="grid grid-cols-[1fr_1fr_140px_190px] border-b bg-[#f8faf7] px-5 py-3 text-xs font-bold text-muted-foreground max-md:grid-cols-[1fr_auto]">
          <span>CLIENT</span><span className="max-md:hidden">PROJECT</span><span className="max-md:hidden">STATUS</span><span className="text-right">ACTIONS</span>
        </div>
        {rows.length ? rows.map((row) => (
          <div key={row.id} className="grid grid-cols-[1fr_1fr_140px_190px] items-center gap-3 border-b px-5 py-4 last:border-0 max-md:grid-cols-[1fr_auto]">
            <div className="min-w-0">
              <p className="truncate font-bold">{row.client_name}</p>
              <p className="truncate text-sm text-muted-foreground">{row.client_email}</p>
              <Badge variant="secondary" className="mt-1 capitalize md:hidden">{row.status}</Badge>
            </div>
            <p className="text-sm max-md:hidden">{row.project_name || 'General feedback'}</p>
            <div className="max-md:hidden">
              <Badge variant="secondary" className="capitalize">{row.status}</Badge>
              {row.reminder_count > 0 && <p className="mt-1 text-xs text-muted-foreground">{row.reminder_count} {row.reminder_count === 1 ? 'reminder' : 'reminders'} sent</p>}
            </div>
            <div className="flex flex-wrap justify-end gap-1">
              <Button size="sm" variant="ghost" onClick={() => copy(row.id, collectionUrl(row.id))} aria-label="Copy private link">{copied === row.id ? <Check /> : <Link2 />}</Button>
              {row.status !== 'completed' && row.client_email && <Button size="sm" variant="outline" disabled={busy === row.id} onClick={() => remind(row)}><BellRing />{busy === row.id ? 'Sending…' : 'Remind'}</Button>}
              {row.status !== 'completed' && <Button size="sm" variant="ghost" onClick={() => complete(row.id)} className="text-[#4f6518]">Done</Button>}
            </div>
          </div>
        )) : (
          <div className="py-20 text-center"><Send className="mx-auto h-9 w-9 text-muted-foreground" /><p className="mt-4 font-bold">No requests sent yet</p><p className="mt-1 text-sm text-muted-foreground">Create your first request from the overview.</p></div>
        )}
      </div>
    </DashboardShell>
  );
}
