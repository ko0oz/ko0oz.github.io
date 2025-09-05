# Portfolio Refactor

Новая версия портфолио с Markdown + статической генерацией.

## Структура

```
test-refactor/
├── content/           # Markdown файлы проектов
├── templates/         # HTML шаблоны
├── scripts/          # Скрипты генерации
├── dist/             # Сгенерированный сайт (создается автоматически)
└── package.json      # Зависимости
```

## Установка

```bash
npm install
```

## Разработка

```bash
# Запуск локального сервера
npm run dev

# В другом терминале - наблюдение за изменениями
npm run watch
```

## Добавление нового проекта

1. Создайте `.md` файл в папке `content/`:

```markdown
---
title: "Название проекта"
category: "design"  # design, cgi, art
year: "2025"
mainImage: "images/preview.jpg"
---

![images/image1.jpg]

Текст проекта...

![images/image2.jpg]

Еще текст...
```

2. Добавьте изображения в папку `images/`
3. Скрипт автоматически сгенерирует HTML

## Сборка для продакшена

```bash
npm run build
```

Результат будет в папке `dist/` - готовый статический сайт.
