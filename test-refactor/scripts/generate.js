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
  const staticFiles = ['images', 'favicon.ico', 'fav.png', 'fav2.ico', 'fav2.png', 'fav3.png', 'fav4.ico'];
  
  staticFiles.forEach(file => {
    const srcPath = path.join('..', file);
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

// Читаем все проекты
function readProjects() {
  // Сначала читаем JSON с основными проектами
  const jsonPath = path.join(config.contentDir, '..', 'projects.json');
  let jsonProjects = [];
  
  if (fs.existsSync(jsonPath)) {
    const jsonContent = fs.readFileSync(jsonPath, 'utf8');
    jsonProjects = JSON.parse(jsonContent).projects;
  }
  
  // Затем читаем Markdown файлы для проектов с контентом
  const contentFiles = fs.readdirSync(config.contentDir);
  const markdownProjects = [];
  
  contentFiles.forEach(file => {
    if (file.endsWith('.md')) {
      const filePath = path.join(config.contentDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data: frontmatter, content } = matter(fileContent);
      
      markdownProjects.push({
        id: path.parse(file).name,
        ...frontmatter,
        content: content.trim(),
        hasContent: true
      });
    }
  });
  
  // Объединяем проекты: если есть Markdown версия, используем её, иначе JSON
  const allProjects = jsonProjects.map(jsonProject => {
    const markdownProject = markdownProjects.find(md => md.id === jsonProject.id);
    if (markdownProject) {
      return {
        ...jsonProject,
        ...markdownProject,
        // Сохраняем теги из JSON, если они есть
        tags: jsonProject.tags || markdownProject.tags,
        hasContent: true
      };
    }
    return {
      ...jsonProject,
      hasContent: false
    };
  });
  
  return allProjects.sort((a, b) => {
    // Сортируем по году, но учитываем диапазоны типа "2019—2021"
    const yearA = a.year.includes('—') ? a.year.split('—')[0] : a.year;
    const yearB = b.year.includes('—') ? b.year.split('—')[0] : b.year;
    return new Date(yearB) - new Date(yearA);
  });
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
    const hasLink = project.hasContent && project.link;
    const tags = project.tags || [];
    const tagsString = tags.join(',');
    
    if (hasLink) {
      return `
  <div class="grid-item" data-tags="${tagsString}"><a href="${project.link}"><img src="${imagePath}" alt="${project.title}"><br>${project.title}</a><br>${tags.join(', ')}<br>${project.year}<br><br></div>`;
    } else {
      return `
  <div class="grid-item" data-tags="${tagsString}"><img src="${imagePath}" alt="${project.title}"><br>${project.title}<br>${tags.join(', ')}<br>${project.year}<br><br></div>`;
    }
  }).join('\n');
  
  const html = template
    .replace('{{HEADER}}', header)
    .replace('{{FOOTER}}', footer)
    .replace('{{PROJECTS_HTML}}', projectsHTML)
    .replace('{{TOTAL_PROJECTS}}', projects.length);
  
  fs.writeFileSync(path.join(config.outputDir, 'index.html'), html);
  console.log('✅ Generated index.html');
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
  
  projectsWithContent.forEach(project => {
    // Настраиваем marked для правильной обработки изображений
    const renderer = new marked.Renderer();
    renderer.image = function(href, title, text) {
      return `<img src="${href}" alt="${text}">`;
    };
    
    marked.setOptions({
      renderer: renderer,
      breaks: true
    });
    
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

    const html = projectTemplate
      .replace('{{HEADER}}', header)
      .replace('{{FOOTER}}', footer)
      .replace(/{{TITLE}}/g, project.title)
      .replace(/{{TAGS}}/g, tagsString)
      .replace(/{{TAGS_LINKS}}/g, tagsLinks)
      .replace(/{{YEAR}}/g, project.year)
      .replace(/{{MAIN_IMAGE}}/g, imagePath)
      .replace(/{{CONTENT}}/g, contentHTML);
    
    const outputPath = path.join(config.outputDir, 'projects', `${project.id}.html`);
    fs.writeFileSync(outputPath, html);
    console.log(`✅ Generated projects/${project.id}.html`);
  });
}

// Генерируем CSS
function generateCSS() {
  const css = fs.readFileSync(path.join(config.templatesDir, 'styles.css'), 'utf8');
  fs.writeFileSync(path.join(config.outputDir, 'styles.css'), css);
  console.log('✅ Generated styles.css');
}

// Основная функция
function build() {
  console.log('🚀 Building portfolio...');
  
  // Копируем статические файлы
  copyStaticFiles();
  
  // Читаем проекты
  const projects = readProjects();
  console.log(`📁 Found ${projects.length} projects`);
  
  // Генерируем страницы
  generateIndex(projects);
  generateProjectPages(projects);
  generateCSS();
  
  console.log('✨ Build complete!');
}

// Запускаем сборку
if (require.main === module) {
  build();
}

module.exports = { build, readProjects };

