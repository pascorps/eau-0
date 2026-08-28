import { getStore } from '@netlify/blobs';

const store = async () => getStore('eau-data');

export default async (req) => {
  const method = (req.method || 'GET').toUpperCase();

  if (method === 'GET') {
    const blob = await (await store()).get('votes', { type: 'json' });
    return Response.json({ votes: blob || {} });
  }

  if (method === 'POST') {
    let body = {};
    try { body = await req.json(); } catch (e) { body = {}; }
    const zone = (body.zone || '').toString().trim();
    const status = (body.status || '').toString().trim();

    if (!zone || !['good', 'bad'].includes(status)) {
      return Response.json({ error: 'Invalid request' }, { status: 400 });
    }

    const s = await store();
    const votes = (await s.get('votes', { type: 'json' })) || {};
    if (!votes[zone]) votes[zone] = { good: 0, bad: 0 };
    votes[zone][status] = (votes[zone][status] || 0) + 1;
    await s.set('votes', JSON.stringify(votes));

    return Response.json({ ok: true, votes });
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405 });
};
