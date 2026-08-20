const wrongPhone = '(62) 99953-121';
const correctPhone = '(62) 99953-1211';

function patchPublicContent(root = document.body) {
  if (!root) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.nodeValue?.includes(wrongPhone)) {
      node.nodeValue = node.nodeValue.replaceAll(wrongPhone, correctPhone);
    }
  }
}

let scheduled = false;
function schedulePatch() {
  if (scheduled) return;
  scheduled = true;

  queueMicrotask(() => {
    scheduled = false;
    patchPublicContent();
  });
}

new MutationObserver(schedulePatch).observe(document.documentElement, {
  childList: true,
  subtree: true,
  characterData: true
});

document.addEventListener('DOMContentLoaded', schedulePatch, { once: true });
schedulePatch();
