// Script Node.js para generar images.json escaneando las carpetas media/
// Ejecutar: node generate-images.js

const fs = require('fs');
const path = require('path');

const MEDIA_DIR = './media';
const OUTPUT_FILE = './images.json';

// Extensiones de imagen soportadas
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.JPG', '.JPEG', '.PNG', '.GIF', '.WEBP'];

function scanDirectory(dirPath, relativePath = '') {
  const items = [];
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relPath = path.join(relativePath, entry.name).replace(/\\/g, '/');
      
      if (entry.isDirectory()) {
        // Recursivo para subdirectorios
        items.push(...scanDirectory(fullPath, relPath));
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (IMAGE_EXTS.includes(ext)) {
          items.push(relPath);
        }
      }
    }
  } catch (err) {
    console.warn(`Error escaneando ${dirPath}:`, err.message);
  }
  
  return items;
}

function organizeByCategory(images) {
  const organized = {
    portfolio: {},
    showcase: {}
  };
  
  images.forEach(imgPath => {
    const parts = imgPath.split('/');
    
    if (parts[0] === '4 BOTONES' && parts.length >= 3) {
      // Imágenes de la sección showcase (4 botones)
      const category = parts[1];
      if (!organized.showcase[category]) {
        organized.showcase[category] = [];
      }
      organized.showcase[category].push('media/' + imgPath);
    } else if (parts.length >= 2) {
      // Imágenes del portafolio
      const category = parts[0];
      if (category !== '4 BOTONES') {
        if (!organized.portfolio[category]) {
          organized.portfolio[category] = [];
        }
        organized.portfolio[category].push('media/' + imgPath);
      }
    }
  });
  
  return organized;
}

console.log('🔍 Escaneando carpeta media/...');
const allImages = scanDirectory(MEDIA_DIR);
console.log(`✅ Encontradas ${allImages.length} imágenes`);

console.log('📁 Organizando por categorías...');
const organized = organizeByCategory(allImages);

const portfolioCount = Object.keys(organized.portfolio).length;
const showcaseCount = Object.keys(organized.showcase).length;
console.log(`   - Portfolio: ${portfolioCount} categorías`);
console.log(`   - Showcase: ${showcaseCount} categorías`);

console.log(`💾 Guardando en ${OUTPUT_FILE}...`);
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(organized, null, 2), 'utf8');

console.log('✨ ¡Listo! Archivo images.json generado correctamente.');
console.log('\n📋 Resumen:');
Object.entries(organized.portfolio).forEach(([cat, imgs]) => {
  console.log(`   - ${cat}: ${imgs.length} imágenes`);
});
console.log('\n🎯 Showcase (4 botones):');
Object.entries(organized.showcase).forEach(([cat, imgs]) => {
  console.log(`   - ${cat}: ${imgs.length} imágenes`);
});
