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
  let current = 0;

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
      const {h, s} = ColorEngine.rgbToHsl(...main.rgb);
      const palette = ColorEngine.palette(h, s, 'light');
      for (const {level, hex} of palette) {
        if ([500, 700, 900].includes(level)) card.style.setProperty('--demo-' + level, hex);
      }
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
  showBook(current);
})();
