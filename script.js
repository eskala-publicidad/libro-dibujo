// Lógica de dibujo para el libro de colorear.
const templates = [
  { label: 'Página 1', src: 'SVG/a.svg' },
  { label: 'Página 2', src: 'SVG/a1.svg' },
  { label: 'Página 3', src: 'SVG/a2.svg' },
  { label: 'Página 4', src: 'SVG/a3.svg' },
  { label: 'Página 5', src: 'SVG/a4.svg' },
  { label: 'Página 6', src: 'SVG/n.svg' },
  { label: 'Página 7', src: 'SVG/n1.svg' },
  { label: 'Página 8', src: 'SVG/n2.svg' },
  { label: 'Página 9', src: 'SVG/n3.svg' },
  { label: 'Página 10', src: 'SVG/n4.svg' }
];
const colors = ['#ff4757', '#ff851b', '#ffdc00', '#2ed573', '#1e90ff', '#5352ed', '#ff6b81', '#2f3542'];
const paintCanvas = document.getElementById('paintCanvas');
const overlayCanvas = document.getElementById('overlayCanvas');
const paletteContainer = document.getElementById('palette');
const zoomPalette = document.getElementById('zoomPalette');
const templateGallery = document.getElementById('templateGallery');
const customColorInput = document.getElementById('customColor');
const brushSizeInput = document.getElementById('brushSize');
const brushSizeValue = document.getElementById('brushSizeValue');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');
const toolButtons = document.querySelectorAll('.tool-button');
const zoomBtn = document.getElementById('zoomBtn');
const zoomBubble = document.getElementById('zoomBubble');
const zoomRange = document.getElementById('zoomRange');
const zoomValue = document.getElementById('zoomValue');
const exitZoomBtn = document.getElementById('exitZoomBtn');
const zoomToolButtons = document.querySelector('.zoom-tool-buttons');
const zoomBrushSizeInput = document.getElementById('zoomBrushSize');
const zoomBrushSizeValue = document.getElementById('zoomBrushSizeValue');
const canvasFrame = document.querySelector('.canvas-frame');
const canvasZoomWrapper = document.querySelector('.canvas-zoom-wrapper');

const paintCtx = paintCanvas.getContext('2d');
const overlayCtx = overlayCanvas.getContext('2d');
let currentColor = colors[0];
let brushSize = Number(brushSizeInput.value);
let currentTool = 'brush';
let isDrawing = false;
let lastPoint = { x: 0, y: 0 };
let currentTemplate = templates[0];
let isZoomActive = false;
let zoomFactor = 1.5;

function setCanvasStyles() {
  paintCtx.lineCap = 'round';
  paintCtx.lineJoin = 'round';
  paintCtx.lineWidth = brushSize;
  paintCtx.strokeStyle = currentColor;
  paintCtx.globalCompositeOperation = 'source-over';
}

function fillBackground() {
  paintCtx.save();
  paintCtx.setTransform(1, 0, 0, 1, 0, 0);
  paintCtx.fillStyle = '#ffffff';
  paintCtx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
  paintCtx.restore();
}

function createColorPalette(container, swatchClass) {
  container.innerHTML = '';
  colors.forEach((color) => {
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.className = swatchClass;
    swatch.style.background = color;
    swatch.addEventListener('click', () => selectColor(color));
    container.appendChild(swatch);
  });
  updateColorSelection();
}

function createPalette() {
  createColorPalette(paletteContainer, 'color-swatch');
}

function createZoomPalette() {
  createColorPalette(zoomPalette, 'zoom-color-swatch');
}

function selectColor(color) {
  currentColor = color;
  if (currentTool !== 'eraser') {
    paintCtx.strokeStyle = currentColor;
  }
  customColorInput.value = color;
  updateColorSelection();
}

function updateColorSelection() {
  document.querySelectorAll('.color-swatch, .zoom-color-swatch').forEach((button) => {
    const isActive = button.style.backgroundColor === ''
      ? false
      : rgbToHex(window.getComputedStyle(button).backgroundColor) === currentColor;
    button.classList.toggle('active', isActive);
  });
}

function rgbToHex(rgb) {
  const match = rgb.match(/\d+/g) || [];
  if (match.length < 3) return '#000000';
  return `#${match.slice(0, 3).map((value) => Number(value).toString(16).padStart(2, '0')).join('')}`;
}

function createTemplateGallery() {
  templateGallery.innerHTML = '';
  templates.forEach((template, index) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'template-card';
    card.dataset.src = template.src;
    card.innerHTML = `<img class="template-thumb" src="${template.src}" alt="${template.label}"><span class="template-label">${template.label}</span>`;
    card.addEventListener('click', () => {
      document.querySelectorAll('.template-card').forEach((item) => item.classList.remove('active'));
      card.classList.add('active');
      currentTemplate = template;
      clearCanvas();
      loadTemplate(template.src);
    });
    templateGallery.appendChild(card);
    if (index === 0) card.classList.add('active');
  });
}

function loadTemplate(src) {
  const templateImage = new Image();
  templateImage.src = src;
  templateImage.onload = () => {
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    overlayCtx.drawImage(templateImage, 0, 0, overlayCanvas.width, overlayCanvas.height);
  };
}

function updateBrushPreview() {
  brushSizeValue.textContent = brushSize;
  zoomBrushSizeValue.textContent = brushSize;
  paintCtx.lineWidth = brushSize;
}

function updateToolSelection() {
  document.querySelectorAll('.tool-button').forEach((button) => {
    const tool = button.dataset.tool;
    const size = button.dataset.size ? Number(button.dataset.size) : null;
    const isActive = tool === currentTool && (tool === 'eraser' || size === brushSize);
    button.classList.toggle('active', isActive);
  });
  document.querySelectorAll('.zoom-tool-button').forEach((button) => {
    const tool = button.dataset.tool;
    const size = button.dataset.size ? Number(button.dataset.size) : null;
    const isActive = tool === currentTool && (tool === 'eraser' || size === brushSize);
    button.classList.toggle('active', isActive);
  });
}

function setTool(tool, size = brushSize) {
  if (tool === 'zoom') {
    toggleZoom();
    return;
  }

  currentTool = tool;
  brushSize = size;
  paintCtx.lineWidth = brushSize;
  brushSizeInput.value = brushSize;
  zoomBrushSizeInput.value = brushSize;
  updateBrushPreview();

  if (tool === 'eraser') {
    paintCtx.globalCompositeOperation = 'destination-out';
    paintCtx.strokeStyle = 'rgba(0,0,0,1)';
  } else {
    paintCtx.globalCompositeOperation = 'source-over';
    paintCtx.strokeStyle = currentColor;
  }
  updateToolSelection();
}

function getCanvasPosition(event) {
  const rect = paintCanvas.getBoundingClientRect();
  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  const clientY = event.touches ? event.touches[0].clientY : event.clientY;
  return {
    x: ((clientX - rect.left) / rect.width) * paintCanvas.width,
    y: ((clientY - rect.top) / rect.height) * paintCanvas.height,
  };
}

function startDrawing(event) {
  event.preventDefault();
  isDrawing = true;
  lastPoint = getCanvasPosition(event);
  paintCtx.beginPath();
  paintCtx.moveTo(lastPoint.x, lastPoint.y);
}

function draw(event) {
  if (!isDrawing) return;
  event.preventDefault();
  const currentPoint = getCanvasPosition(event);
  paintCtx.lineTo(currentPoint.x, currentPoint.y);
  paintCtx.stroke();
  lastPoint = currentPoint;
}

function stopDrawing() {
  if (!isDrawing) return;
  isDrawing = false;
  paintCtx.closePath();
}

function clearCanvas() {
  paintCtx.clearRect(0, 0, paintCanvas.width, paintCanvas.height);
  fillBackground();
}

function downloadArtwork() {
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = paintCanvas.width;
  exportCanvas.height = paintCanvas.height;
  const exportCtx = exportCanvas.getContext('2d');
  exportCtx.fillStyle = '#ffffff';
  exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
  exportCtx.drawImage(paintCanvas, 0, 0);
  exportCtx.drawImage(overlayCanvas, 0, 0);
  const link = document.createElement('a');
  link.download = 'libro-para-colorear.png';
  link.href = exportCanvas.toDataURL('image/png');
  link.click();
}

function applyZoom() {
  canvasZoomWrapper.style.transform = `scale(${zoomFactor})`;
  canvasZoomWrapper.style.setProperty('--zoom-factor', zoomFactor);
  zoomValue.textContent = `${Math.round(zoomFactor * 100)}%`;
}

function toggleZoom() {
  isZoomActive = !isZoomActive;
  canvasFrame.classList.toggle('zoom-active', isZoomActive);
  zoomBubble.classList.toggle('hidden', !isZoomActive);
  zoomBtn.classList.toggle('active', isZoomActive);
  if (isZoomActive) {
    zoomRange.value = zoomFactor;
    zoomBrushSizeInput.value = brushSize;
    zoomBrushSizeValue.textContent = brushSize;
    createZoomPalette();
    createZoomToolButtons();
    updateToolSelection();
    applyZoom();
  } else {
    zoomFactor = 1.5;
    applyZoom();
  }
}

function createZoomToolButtons() {
  zoomToolButtons.innerHTML = '';
  const zoomTools = [
    { label: 'Lápiz fino', tool: 'brush', size: 4 },
    { label: 'Lápiz medio', tool: 'brush', size: 10 },
    { label: 'Lápiz grueso', tool: 'brush', size: 20 },
    { label: 'Borrador', tool: 'eraser' }
  ];
  zoomTools.forEach(({ label, tool, size }) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'zoom-tool-button';
    button.textContent = label;
    button.dataset.tool = tool;
    if (size) button.dataset.size = size;
    button.addEventListener('click', () => setTool(tool, size || brushSize));
    zoomToolButtons.appendChild(button);
  });
}

function attachEvents() {
  paintCanvas.addEventListener('mousedown', startDrawing);
  paintCanvas.addEventListener('mousemove', draw);
  paintCanvas.addEventListener('mouseup', stopDrawing);
  paintCanvas.addEventListener('mouseleave', stopDrawing);

  paintCanvas.addEventListener('touchstart', startDrawing, { passive: false });
  paintCanvas.addEventListener('touchmove', draw, { passive: false });
  paintCanvas.addEventListener('touchend', stopDrawing);
  paintCanvas.addEventListener('touchcancel', stopDrawing);

  toolButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const tool = button.dataset.tool;
      const size = button.dataset.size ? Number(button.dataset.size) : brushSize;
      setTool(tool, size);
    });
  });

  zoomBtn.addEventListener('click', () => setTool('zoom'));
  exitZoomBtn.addEventListener('click', () => {
    if (isZoomActive) toggleZoom();
  });

  zoomRange.addEventListener('input', (event) => {
    zoomFactor = Number(event.target.value);
    applyZoom();
  });

  zoomBrushSizeInput.addEventListener('input', (event) => {
    const size = Number(event.target.value);
    setTool(currentTool, size);
  });

  brushSizeInput.addEventListener('input', (event) => {
    const size = Number(event.target.value);
    setTool(currentTool, size);
  });

  customColorInput.addEventListener('input', (event) => {
    selectColor(event.target.value);
  });

  clearBtn.addEventListener('click', clearCanvas);
  downloadBtn.addEventListener('click', downloadArtwork);
}

function initialize() {
  paintCanvas.width = 1280;
  paintCanvas.height = 960;
  overlayCanvas.width = 1280;
  overlayCanvas.height = 960;
  setCanvasStyles();
  fillBackground();
  createPalette();
  createTemplateGallery();
  loadTemplate(currentTemplate.src);
  attachEvents();
  updateBrushPreview();
  updateToolSelection();
  applyZoom();
}

initialize();
