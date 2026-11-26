(() => {
  const books = [
    ['廓晋', 'xuanjin'],
    ['以神通之名', 'shentong'],
    ['星河之主', 'xinghe'],
    ['原来我是仙道天骄', 'xiandao']
  ];
  const cover = document.getElementById('demo-cover');
  const title = document.getElementById('demo-title');
  const next = document.getElementById('next-cover');
  const error = document.getElementById('demo-error');
  const card = cover.closest('.recommendation');
  const panel = card.closest('.usage-panel');
  const modeButton = document.getElementById('usage-mode');
  const tipLabels = Array.from(card.querySelectorAll('.card-tip'), tip => ({
    node: tip.firstChild,
    lightText: tip.firstChild.textContent
  }));
  let current = 0;
  let mode = 'light';
  let mainColor;

  function updateCardColors() {
    if (!mainColor) return;
    for (const {level, hex} of ColorEngine.palette(mainColor.h, mainColor.s, mode)) {
      if ([500, 700, 900].includes(level)) card.style.setProperty('--demo-' + level, hex);
    }
  }

  async function showBook(index) {
    next.disabled = true;
    error.textContent = '';
    const [name, asset] = books[index];
    const image = new Image();
    image.src = 'assets/demo-' + asset + '.png';
    try {
      await image.decode();
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 160 / Math.max(image.naturalWidth, image.naturalHeight));
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const [main] = ColorEngine.extract(context.getImageData(0, 0, canvas.width, canvas.height).data);
      mainColor = ColorEngine.rgbToHsl(...main.rgb);
      updateCardColors();
      cover.src = image.src;
      title.textContent = name;
      current = index;
    } catch {
      error.textContent = '无法读取示例封面，请重试。';
    } finally {
      next.disabled = false;
    }
  }

  next.addEventListener('click', () => showBook((current + 1) % books.length));
  modeButton.addEventListener('click', () => {
    const dark = mode === 'light';
    mode = dark ? 'dark' : 'light';
    panel.dataset.mode = mode;
    modeButton.setAttribute('aria-pressed', String(dark));
    modeButton.title = dark ? '切换到日间模式' : '切换到夜间模式';
    for (const {node, lightText} of tipLabels) {
      node.textContent = dark ? lightText.replace(/ColorFont_\d+/, '$&_D') : lightText;
    }
    updateCardColors();
  });
  showBook(current);
})();
