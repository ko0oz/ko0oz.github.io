const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

// Конфигурация
const config = {
  contentDir: './content',
  outputDir: './dist',
  templatesDir: './templates',
  projectsDir: './projects'
};

// Создаем выходную директорию
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

// Копируем статические файлы
function copyStaticFiles() {
  const staticFiles = ['images', 'projects', 'favicon.ico', 'fav.png', 'fav2.ico', 'fav2.png', 'fav3.png', 'fav4.ico'];
  
  staticFiles.forEach(file => {
    const srcPath = path.join('.', file);
    const destPath = path.join(config.outputDir, file);
    
    if (fs.existsSync(srcPath)) {
      if (fs.statSync(srcPath).isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  });
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Читаем все проекты из Markdown файлов
function readProjects() {
  const contentFiles = fs.readdirSync(config.contentDir);
  const projects = [];

  contentFiles.forEach(file => {
    if (file.endsWith('.md')) {
      const filePath = path.join(config.contentDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data: frontmatter, content } = matter(fileContent);

      projects.push({
        id: path.parse(file).name,
        ...frontmatter,
        content: content.trim(),
        hasContent: content.trim().length > 0, // Project has content if Markdown body is not empty
        image: frontmatter.mainImage // Use mainImage as image for grid
      });
    }
  });

  return projects.sort((a, b) => {
    // Простая сортировка: сначала по году, потом по месяцу
    const yearA = parseInt(a.year.includes('—') ? a.year.split('—')[0] : a.year) || 0;
    const yearB = parseInt(b.year.includes('—') ? b.year.split('—')[0] : b.year) || 0;
    
    // Сначала по году (новые сверху)
    if (yearA !== yearB) {
      return yearB - yearA;
    }
    
    // Потом по месяцу (новые сверху)
    const monthA = a.month || '00';
    const monthB = b.month || '00';
    return monthB.localeCompare(monthA);
  });
}

// Форматируем дату для отображения
function formatDate(project) {
  const month = project.month || '01';
  const year = project.year.includes('—') ? project.year.split('—')[0] : project.year;
  return `${month}/${year}`;
}

// Проверяем существование файлов в контенте
function checkMissingFiles(content, projectId) {
  const fileRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  const missingFiles = [];
  
  while ((match = fileRegex.exec(content)) !== null) {
    const filePath = match[2];
    const fullPath = path.join('.', 'projects', projectId, filePath);
    
    if (!fs.existsSync(fullPath)) {
      missingFiles.push(filePath);
    }
  }
  
  if (missingFiles.length > 0) {
    console.log(`Missing files in project ${projectId}:`, missingFiles);
  }
  
  return missingFiles;
}

// Читаем части страниц
function readPartials(isProjectPage = false) {
  const headerFile = isProjectPage ? 'header-project.html' : 'header.html';
  const header = fs.readFileSync(path.join(config.templatesDir, 'partials', headerFile), 'utf8');
  const footer = fs.readFileSync(path.join(config.templatesDir, 'partials', 'footer.html'), 'utf8');
  return { header, footer };
}

// Генерируем главную страницу
function generateIndex(projects) {
  const template = fs.readFileSync(path.join(config.templatesDir, 'index.html'), 'utf8');
  const { header, footer } = readPartials();
  
  // Генерируем HTML для проектов
  const projectsHTML = projects.map(project => {
    const imagePath = project.image || project.mainImage || 'images/placeholder.jpg';
    const hasLink = project.hasContent;
    const tags = project.tags || [];
    const tagsString = tags.join(',');
    const projectLink = hasLink ? `projects/${project.id}.html` : null;
    const formattedDate = formatDate(project);
    
    if (hasLink) {
      return `
  <div class="grid-item" data-tags="${tagsString}"><a href="${projectLink}"><img src="${imagePath}" alt="${project.title}"><br>${project.title}</a><br>${tags.join(', ')}<br>${formattedDate}<br><br></div>`;
    } else {
      return `
  <div class="grid-item" data-tags="${tagsString}"><img src="${imagePath}" alt="${project.title}"><br>${project.title}<br>${tags.join(', ')}<br>${formattedDate}<br><br></div>`;
    }
  }).join('\n');
  
  const html = template
    .replace('{{HEADER}}', header)
    .replace('{{FOOTER}}', footer)
    .replace('{{PROJECTS_HTML}}', projectsHTML)
    .replace('{{TOTAL_PROJECTS}}', projects.length);
  
  fs.writeFileSync(path.join(config.outputDir, 'index.html'), html);
  console.log('Generated index.html');
}

// Генерируем страницы проектов
function generateProjectPages(projects) {
  const projectTemplate = fs.readFileSync(path.join(config.templatesDir, 'project.html'), 'utf8');
  const { header, footer } = readPartials(true);
  
  if (!fs.existsSync(path.join(config.outputDir, 'projects'))) {
    fs.mkdirSync(path.join(config.outputDir, 'projects'), { recursive: true });
  }
  
  // Генерируем только проекты с контентом
  const projectsWithContent = projects.filter(project => project.hasContent);
  
  projectsWithContent.forEach((project, index) => {
    // Определяем следующий и предыдущий проекты
    const nextProject = index > 0 ? projectsWithContent[index - 1] : null; // Более новый (выше в списке)
    const prevProject = index < projectsWithContent.length - 1 ? projectsWithContent[index + 1] : null; // Более старый (ниже в списке)
    
    // Настраиваем marked для правильной обработки изображений и видео
    const renderer = new marked.Renderer();
    renderer.image = function(href, title, text) {
      // Проверяем, является ли файл видео
      const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
      const isVideo = videoExtensions.some(ext => href.toLowerCase().endsWith(ext));
      
      if (isVideo) {
        return `<video width="1400" autoplay loop muted playsinline><source src="${href}" type="video/mp4">SOMETHING WRONG WITH VIDEO ¯\\_(ツ)_/¯.</video>`;
      } else {
        return `<img src="${href}" alt="${text}">`;
      }
    };
    
    marked.setOptions({
      renderer: renderer,
      breaks: true
    });
    
    // Проверяем отсутствующие файлы
    checkMissingFiles(project.content, project.id);
    
    // Исправляем синтаксис изображений в Markdown
    const fixedContent = project.content.replace(/!\[([^\]]*)\]/g, '![]($1)');
    const contentHTML = marked(fixedContent);
    const imagePath = project.image || project.mainImage || 'images/placeholder.jpg';
    
    const tags = project.tags || [];
    const tagsString = tags.join(', ');
    
    // Создаем кликабельные теги
    const tagsLinks = tags.map(tag => 
      `<a href="../index.html?tag=${tag}">${tag}</a>`
    ).join(', ');

    const formattedDate = formatDate(project);
    
    // Создаем навигацию
    let navigation = '<div class="nav-container">';
    if (nextProject) {
      navigation += `<a href="${nextProject.id}.html" class="nav-btn nav-next">← ${nextProject.title}</a>`;
    } else {
      navigation += '<div></div>'; // Пустой div для выравнивания
    }
    if (prevProject) {
      navigation += `<a href="${prevProject.id}.html" class="nav-btn nav-prev">${prevProject.title} →</a>`;
    } else {
      navigation += '<div></div>'; // Пустой div для выравнивания
    }
    navigation += '</div>';
    
    const html = projectTemplate
      .replace('{{HEADER}}', header)
      .replace('{{FOOTER}}', footer)
      .replace(/{{TITLE}}/g, project.title)
      .replace(/{{TAGS}}/g, tagsString)
      .replace(/{{TAGS_LINKS}}/g, tagsLinks)
      .replace(/{{YEAR}}/g, formattedDate)
      .replace(/{{MAIN_IMAGE}}/g, imagePath)
      .replace(/{{CONTENT}}/g, contentHTML)
      .replace(/{{NAVIGATION}}/g, navigation);
    
    const outputPath = path.join(config.outputDir, 'projects', `${project.id}.html`);
    fs.writeFileSync(outputPath, html);
    console.log(`Generated projects/${project.id}.html`);
  });
}

// Генерируем CSS
function generateCSS() {
  const css = fs.readFileSync(path.join(config.templatesDir, 'styles.css'), 'utf8');
  fs.writeFileSync(path.join(config.outputDir, 'styles.css'), css);
  console.log('Generated styles.css');
}

// Основная функция
function build() {
  console.log('Building portfolio...');
  
  // Копируем статические файлы
  copyStaticFiles();
  
  // Читаем проекты
  const projects = readProjects();
  console.log(`Found ${projects.length} projects`);
  
  // Генерируем страницы
  generateIndex(projects);
  generateProjectPages(projects);
  generateCSS();
  
  console.log('Build complete');
}

// Запускаем сборку
if (require.main === module) {
  build();
}

module.exports = { build, readProjects };

