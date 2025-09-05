const chokidar = require('chokidar');
const { build } = require('./generate');

console.log('👀 Watching for changes...');

// Наблюдаем за изменениями в content и templates
const watcher = chokidar.watch(['./content/**/*.md', './templates/**/*'], {
  ignored: /^\./, // игнорируем скрытые файлы
  persistent: true
});

watcher
  .on('add', path => {
    console.log(`📁 File added: ${path}`);
    build();
  })
  .on('change', path => {
    console.log(`📝 File changed: ${path}`);
    build();
  })
  .on('unlink', path => {
    console.log(`🗑️  File removed: ${path}`);
    build();
  })
  .on('error', error => console.log(`❌ Watcher error: ${error}`));

console.log('✅ Watcher started. Press Ctrl+C to stop.');
