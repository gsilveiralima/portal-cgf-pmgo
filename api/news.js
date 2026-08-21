const PMGO_ENDPOINT = 'https://goias.gov.br/policiamilitar/wp-json/wp/v2/posts?per_page=6&_embed=1&_fields=id,date,link,title,excerpt,rttpg_featured_image_url,_embedded';
const PMGO_ORIGIN = 'https://goias.gov.br';

function clean(value = '') {
  return String(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, '’')
    .replace(/&#8211;/g, '–')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function officialUrl(value) {
  try {
    const url = new URL(String(value || ''));
    return url.protocol === 'https:' && url.hostname === 'goias.gov.br' && url.pathname.startsWith('/policiamilitar/')
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function officialImage(value) {
  try {
    const url = new URL(String(value || ''));
    return url.protocol === 'https:' && (url.hostname === 'goias.gov.br' || url.hostname.endsWith('.goias.gov.br'))
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function normalizePost(post) {
  const link = officialUrl(post?.link);
  if (!link) return null;
  const image = officialImage(post?.rttpg_featured_image_url?.full?.[0])
    || officialImage(post?._embedded?.['wp:featuredmedia']?.[0]?.source_url);
  const category = clean(post?._embedded?.['wp:term']?.[0]?.[0]?.name) || 'PMGO';
  return {
    id: post?.id,
    date: post?.date,
    link,
    title: clean(post?.title?.rendered) || 'Atualização da PMGO',
    excerpt: clean(post?.excerpt?.rendered).replace(/\s*\[…\]\s*$/, ''),
    image,
    category
  };
}

function toWordPressCompat(post) {
  return {
    id: post.id,
    date: post.date,
    link: post.link,
    title: { rendered: post.title },
    excerpt: { rendered: post.excerpt },
    rttpg_featured_image_url: post.image ? { full: [post.image] } : undefined,
    _embedded: { 'wp:term': [[{ name: post.category }]] }
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, message: 'Método não permitido.' });
  }

  const compat = String(req.query?.format || '').toLowerCase() === 'wp';
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=86400');

  try {
    const upstream = await fetch(PMGO_ENDPOINT, {
      headers: { Accept: 'application/json', 'User-Agent': 'Portal-CGF-PMGO/2.2' },
      signal: AbortSignal.timeout(7000)
    });
    if (!upstream.ok) throw new Error(`PMGO ${upstream.status}`);

    const data = await upstream.json();
    const posts = Array.isArray(data)
      ? data.slice(0, 6).map(normalizePost).filter(Boolean)
      : [];

    if (compat) return res.status(200).json(posts.map(toWordPressCompat));
    return res.status(200).json({
      ok: true,
      source: 'Portal oficial da PMGO',
      sourceUrl: PMGO_ORIGIN + '/policiamilitar/',
      fetchedAt: new Date().toISOString(),
      posts
    });
  } catch {
    if (compat) return res.status(200).json([]);
    return res.status(200).json({
      ok: false,
      source: 'Portal oficial da PMGO',
      sourceUrl: PMGO_ORIGIN + '/policiamilitar/',
      fetchedAt: new Date().toISOString(),
      posts: [{
        id: 'fallback',
        date: new Date().toISOString(),
        link: PMGO_ORIGIN + '/policiamilitar/',
        title: 'Portal oficial da PMGO',
        excerpt: 'O serviço automático de notícias está temporariamente indisponível. Consulte as publicações diretamente no portal oficial.',
        image: null,
        category: 'PMGO'
      }]
    });
  }
}
