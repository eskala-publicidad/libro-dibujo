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
const canvasZoomWrapper = document.querySelector('.canvas-zoom-wrapper');
const paletteContainer = document.getElementById('palette');
const templateGallery = document.getElementById('templateGallery');
const customColorInput = document.getElementById('customColor');
const brushSizeInput = document.getElementById('brushSize');
const brushSizeValue = document.getElementById('brushSizeValue');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');
const toolButtons = document.querySelectorAll('.tool-button');

const paintCtx = paintCanvas.getContext('2d');
const overlayCtx = overlayCanvas.getContext('2d');
let currentColor = colors[0];
let brushSize = Number(brushSizeInput.value);
let currentTool = 'brush';
let isDrawing = false;
let lastPoint = { x: 0, y: 0 };
let currentTemplate = templates[0];
let transform = { x: 0, y: 0, scale: 1 };
let gesture = {
  active: false,
  initialDistance: 0,
  initialScale: 1,
  initialTranslate: { x: 0, y: 0 },
  startCenter: { x: 0, y: 0 }
};

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

function applyTransform() {
  canvasZoomWrapper.style.transform = `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`;
}

function createPalette() {
  paletteContainer.innerHTML = '';
  colors.forEach((color) => {
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.className = 'color-swatch';
    swatch.dataset.color = color;
    swatch.style.background = color;
    swatch.addEventListener('click', () => selectColor(color));
    paletteContainer.appendChild(swatch);
  });
  updateColorSelection();
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
  document.querySelectorAll('.color-swatch').forEach((button) => {
    button.classList.toggle('active', button.dataset.color === currentColor);
  });
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
  paintCtx.lineWidth = brushSize;
}

function updateToolSelection() {
  toolButtons.forEach((button) => {
    const tool = button.dataset.tool;
    const size = button.dataset.size ? Number(button.dataset.size) : null;
    const active = tool === currentTool && (tool === 'eraser' || size === brushSize);
    button.classList.toggle('active', active);
  });
}

function setTool(tool, size = brushSize) {
  currentTool = tool;
  brushSize = size;
  paintCtx.lineWidth = brushSize;
  brushSizeInput.value = brushSize;
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
  if (event.touches && event.touches.length > 1) return;
  event.preventDefault();
  isDrawing = true;
  lastPoint = getCanvasPosition(event);
  paintCtx.beginPath();
  paintCtx.moveTo(lastPoint.x, lastPoint.y);
}

function draw(event) {
  if (!isDrawing) return;
  if (event.touches && event.touches.length > 1) return;
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

function distance(a, b) {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

function midpoint(a, b) {
  return {
    x: (a.clientX + b.clientX) / 2,
    y: (a.clientY + b.clientY) / 2
  };
}

function startGesture(touches) {
  gesture.active = true;
  gesture.initialDistance = distance(touches[0], touches[1]);
  gesture.initialScale = transform.scale;
  gesture.startCenter = midpoint(touches[0], touches[1]);
  gesture.initialTranslate = { ...transform };
}

function moveGesture(touches) {
  const newDistance = distance(touches[0], touches[1]);
  const scale = Math.max(1, Math.min(3, gesture.initialScale * newDistance / gesture.initialDistance));
  const currentCenter = midpoint(touches[0], touches[1]);
  const deltaX = currentCenter.x - gesture.startCenter.x;
  const deltaY = currentCenter.y - gesture.startCenter.y;
  transform.scale = scale;
  transform.x = gesture.initialTranslate.x + deltaX;
  transform.y = gesture.initialTranslate.y + deltaY;
  applyTransform();
}

function endGesture(touches) {
  if (touches.length < 2) {
    gesture.active = false;
  }
}

function onTouchStart(event) {
  if (event.touches.length === 2) {
    stopDrawing();
    startGesture(event.touches);
  } else {
    startDrawing(event);
  }
}

function onTouchMove(event) {
  if (gesture.active && event.touches.length === 2) {
    event.preventDefault();
    moveGesture(event.touches);
    return;
  }
  if (event.touches.length === 1) {
    draw(event);
  }
}

function onTouchEnd(event) {
  if (gesture.active) {
    endGesture(event.touches);
  }
  if (event.touches.length === 0) {
    stopDrawing();
  }
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

function attachEvents() {
  paintCanvas.addEventListener('mousedown', startDrawing);
  paintCanvas.addEventListener('mousemove', draw);
  paintCanvas.addEventListener('mouseup', stopDrawing);
  paintCanvas.addEventListener('mouseleave', stopDrawing);

  paintCanvas.addEventListener('touchstart', onTouchStart, { passive: false });
  paintCanvas.addEventListener('touchmove', onTouchMove, { passive: false });
  paintCanvas.addEventListener('touchend', onTouchEnd);
  paintCanvas.addEventListener('touchcancel', onTouchEnd);

  toolButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const tool = button.dataset.tool;
      const size = button.dataset.size ? Number(button.dataset.size) : brushSize;
      setTool(tool, size);
    });
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
  applyTransform();
}

initialize();
