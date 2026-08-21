// Ponte de compatibilidade para o bundle canônico gerado no Work.
// Mantém correções públicas verificadas sem editar manualmente o artefato minificado.

const TEXT_PATCHES = new Map([
  ['(62) 99953-121', '(62) 99953-1211']
]);

function patchTextNode(node) {
  if (!node?.nodeValue) return;
  let next = node.nodeValue;
  for (const [from, to] of TEXT_PATCHES) {
    if (next.includes(from)) next = next.replaceAll(from, to);
  }
  if (next !== node.nodeValue) node.nodeValue = next;
}

function patchTree(root) {
  if (!root) return;
  if (root.nodeType === Node.TEXT_NODE) {
    patchTextNode(root);
    return;
  }
  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) patchTextNode(walker.currentNode);
}

function installNewsProxy() {
  if (window.__CGF_NEWS_PROXY__) return;
  window.__CGF_NEWS_PROXY__ = true;

  const nativeFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const rawUrl = typeof input === 'string' ? input : input?.url;
    if (rawUrl) {
      try {
        const url = new URL(rawUrl, window.location.href);
        const isPmgoFeed = url.hostname === 'goias.gov.br'
          && url.pathname === '/policiamilitar/wp-json/wp/v2/posts';
        if (isPmgoFeed) return nativeFetch('/api/news?format=wp', init);
      } catch {
        // URL inválida: deixa a implementação nativa decidir como tratar.
      }
    }
    return nativeFetch(input, init);
  };
}

installNewsProxy();

const observer = new MutationObserver((records) => {
  for (const record of records) {
    if (record.type === 'characterData') patchTextNode(record.target);
    for (const node of record.addedNodes || []) patchTree(node);
  }
});

function startPatches() {
  patchTree(document.body);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startPatches, { once: true });
else startPatches();
