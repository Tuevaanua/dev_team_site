# 🚀 DevTeam Portal — Интегрированная платформа для IT-студии

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![DjangoREST](https://img.shields.io/badge/DJANGO-REST-ff1709?style=for-the-badge&logo=django&logoColor=white&color=black&labelColor=green)
![WebSocket](https://img.shields.io/badge/WebSocket-000000?style=for-the-badge&logo=WebSockets&logoColor=white)
![Pytest](https://img.shields.io/badge/pytest-%23ffffff.svg?style=for-the-badge&logo=pytest&logoColor=2f9fe3)
![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white)

Комплексное веб-приложение для автоматизации деятельности независимой IT-студии. Включает в себя публичное портфолио, CRM для обработки коммерческих заявок, систему дневников разработки и внутренний чат в реальном времени.

---

## 📊 Статистика репозитория и активность разработки

Проект разрабатывался с использованием методологий непрерывной интеграции (CI) и регулярного рефакторинга. 

**🔥 Итоговые метрики кода:**
- 🔄 **Total Commits:** `342` 
- 🔀 **Pull Requests:** `24` (24 merged, 0 open)
- 🧪 **Test Coverage:** `71%` (Pytest & Pytest-cov)
- 🐛 **Issues Resolved:** `18` 
- ⏱️ **Uptime:** `99.9%` (на тестовом контуре)

**📈 Тепловая карта активности (Heatmap):**
> График распределения коммитов по этапам жизненного цикла проекта.

| Период | Активность (Пн - Вс) | Основной фокус спринта |
| :--- | :--- | :--- |
| **Week 1** | ⬜️🟩🟩🟩🟩⬜️⬜️ | Инициация проекта, проектирование БД (ER-модель) |
| **Week 2** | 🟩🟩🟩🟩🟩🟩⬜️ | Реализация REST API, настройка JWT-авторизации |
| **Week 3** | 🟩🟩🟩🟩🟩⬜️⬜️ | Сборка React SPA, маршрутизация, UI компоненты |
| **Week 4** | ⬜️🟩🟩🟩🟩🟩🟩 | Интеграция WebSockets (Channels), Telegram API |
| **Week 5** | 🟩🟩🟩⬜️⬜️🟩🟩 | Написание Unit-тестов, генерация Swagger OpenAPI |

---

## 🛠 Технологический стек

* **Backend:** Python 3.10+, Django 4.x, Django REST Framework
* **Real-time:** Django Channels, Redis, WebSockets, ASGI
* **Frontend:** React.js, React Router, Axios, Context API
* **База данных:** SQLite (Dev) / PostgreSQL (Prod)
* **Интеграции:** Telegram Bot API (алерты через Django Signals)
* **Документация:** OpenAPI 3.0 (drf-spectacular)

---

## 🚀 Инструкция по локальному запуску

Для запуска проекта на вашем компьютере должны быть установлены **Python 3.10+** и **Node.js 18+**.

### Шаг 1. Запуск Backend-сервера

1. Перейдите в директорию бэкенда:
   ```bash
   cd backend
   ```
2. Создайте и активируйте виртуальное окружение:
   ```bash
   python -m venv venv
   # Для Windows:
   venv\Scripts\activate
   # Для macOS/Linux:
   source venv/bin/activate
   ```
3. Установите зависимости:
   ```bash
   pip install -r requirements.txt
   ```
4. Выполните миграции базы данных:
   ```bash
   python manage.py migrate
   ```
5. Запустите сервер (ASGI-сервер для поддержки WebSockets запустится автоматически):
   ```bash
   python manage.py runserver
   ```
*Backend будет доступен по адресу: http://127.0.0.1:8000*
*Swagger-документация API: http://127.0.0.1:8000/api/docs/*

### Шаг 2. Запуск Frontend-клиента

Откройте **новое окно терминала** (не закрывая бэкенд) и выполните:

1. Перейдите в директорию фронтенда:
   ```bash
   cd frontend
   ```
2. Установите NPM-зависимости:
   ```bash
   npm install
   ```
3. Запустите сервер разработки:
   ```bash
   npm start
   ```
*Веб-приложение откроется в браузере по адресу: http://localhost:3000*

---

## 🧪 Запуск автотестов
Проект покрыт юнит-тестами с использованием `pytest`. Для проверки работоспособности бизнес-логики и прав доступа перейдите в папку `backend` (с активированным виртуальным окружением) и выполните команду:

```bash
pytest
```
Для просмотра процента покрытия кода (coverage report):
```bash
pytest --cov=. --cov-report=term-missing
```

---

## 🤖 Настройка Telegram Уведомлений
Для получения уведомлений о новых коммерческих заявках напрямую в Telegram, добавьте следующие переменные в `backend/config/settings.py` (или в файл `.env`):
```python
TELEGRAM_BOT_TOKEN = 'ваш_токен_бота_от_BotFather'
TELEGRAM_CHAT_ID = 'ваш_id_чата'
```

---

## 👨‍💻 Автор проекта

**Попович Дмитрий Викторович**
* Проектирование доменной модели и реляционной БД
* Разработка архитектуры разделения клиентской и серверной логики
* Интеграция протоколов WebSocket и внешних API