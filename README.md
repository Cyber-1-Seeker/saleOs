# ⚡ SalesOS — Personal Sales CRM

Минималистичная CRM-система для управления продажами. React + TypeScript + Vite на фронте, Django + DRF + JWT на бэке.

---

## 🚀 Быстрый старт

### Windows
```
Двойной клик на start.bat
```

### macOS / Linux
```bash
chmod +x start.sh
./start.sh
```

Скрипт автоматически:
- Создаст виртуальное окружение Python
- Установит все зависимости
- Выполнит миграции базы данных
- Запустит оба сервера

После запуска открой **http://localhost:5173** в браузере.

---

## 📁 Структура проекта

```
salesos/
├── backend/                  # Django + DRF
│   ├── apps/
│   │   ├── users/            # JWT Auth, регистрация
│   │   ├── clients/          # Клиенты + история сообщений
│   │   ├── pipeline/         # Воронка (этапы + сделки)
│   │   ├── templates/        # Шаблоны ответов
│   │   ├── catalog/          # Каталог по клиентам + медиа
│   │   └── reminders/        # Follow-up напоминания
│   ├── config/               # settings, urls, wsgi
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/                 # React + TypeScript + Vite
│   ├── src/
│   │   ├── api/              # axios client + API модули
│   │   ├── components/       # Layout, UI components
│   │   ├── pages/            # 6 страниц
│   │   ├── store/            # Zustand (auth, theme)
│   │   └── styles/           # globals.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── start.bat                 # Запуск на Windows
└── start.sh                  # Запуск на macOS/Linux
```

---

## 🔧 Ручной запуск

### Backend
```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Первый вход

1. Открой http://localhost:5173/register
2. Создай аккаунт
3. Всё — ты в системе

### Django Admin
```bash
cd backend
python manage.py createsuperuser
# затем открой http://localhost:8000/admin
```

---

## 📦 Модули

| Модуль | Описание |
|--------|----------|
| **Дашборд** | Статистика, горячие клиенты, follow-up сегодня, обзор воронки |
| **Клиенты** | Карточки с историей, заметками, бюджетом, статусом |
| **Воронка** | Drag & drop kanban по этапам |
| **Шаблоны** | Быстрые ответы, копирование в буфер, счётчик использований |
| **Каталог** | Позиции по клиентам с фото/видео, ценой, маржой |
| **Follow-up** | Напоминания с приоритетами, просроченные, статистика |

---

## ⚙️ Технологии

**Frontend:** React 18, TypeScript, Vite, React Router 6, Zustand, Axios, @hello-pangea/dnd, dayjs

**Backend:** Django 4.2, Django REST Framework, SimpleJWT, django-cors-headers, Pillow

**БД:** SQLite (для старта, легко меняется на PostgreSQL)

---

## 🔄 Смена базы на PostgreSQL

В `backend/config/settings.py` замени:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'salesos',
        'USER': 'postgres',
        'PASSWORD': 'yourpassword',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```
Затем: `pip install psycopg2-binary` и `python manage.py migrate`

---

## 🎨 Темы

Переключение тёмная / бежевая — кнопка в нижней части сайдбара. Настройка сохраняется в localStorage.
