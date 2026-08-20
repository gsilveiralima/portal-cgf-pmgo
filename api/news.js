const PMGO_ENDPOINT = 'https://goias.gov.br/policiamilitar/wp-json/wp/v2/posts?per_page=6&_fields=id,date,link,title,excerpt';

function clean(value = '') {
  return String(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, '’')
    .replace(/&#8211;/g, '–')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, message: 'Método não permitido.' });
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=86400');

  try {
    const upstream = await fetch(PMGO_ENDPOINT, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'Portal-CGF-PMGO/2.0' },
      signal: AbortSignal.timeout(7000)
    });
    if (!upstream.ok) throw new Error(`PMGO ${upstream.status}`);
    const data = await upstream.json();
    const posts = Array.isArray(data) ? data.slice(0, 6).map((post) => ({
      id: post.id,
      date: post.date,
      link: post.link,
      title: clean(post.title?.rendered),
      excerpt: clean(post.excerpt?.rendered).replace(/\s*\[…\]\s*$/, '')
    })).filter((post) => /^https:\/\/goias\.gov\.br\/policiamilitar\//.test(post.link || '')) : [];
    return res.status(200).json({ ok: true, source: 'Portal oficial da PMGO', fetchedAt: new Date().toISOString(), posts });
  } catch {
    return res.status(200).json({
      ok: false,
      source: 'Portal oficial da PMGO',
      fetchedAt: new Date().toISOString(),
      posts: [{
        id: 'fallback', date: new Date().toISOString(),
        link: 'https://goias.gov.br/policiamilitar/',
        title: 'Portal oficial da PMGO',
        excerpt: 'O serviço automático de notícias está temporariamente indisponível. Consulte as publicações diretamente no portal oficial.'
      }]
    });
  }
}
