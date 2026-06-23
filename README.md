# URL Checker

Сервис асинхронной проверки URL: принимает список адресов, отправляет HEAD-запросы параллельно и отдаёт результаты по polling. Задание можно отменить в процессе.

## Стек

| Слой | Технологии |
|------|------------|
| Backend | Node.js 20, TypeScript, NestJS, axios |
| Frontend | React 18, TypeScript, Vite, Zustand |
| Infra | Docker Compose, nginx |

## Быстрый старт

```bash
docker compose up --build
```

Приложение: http://localhost:8080  
API: http://localhost:8080/api/jobs

## Локальная разработка

**Backend** (http://localhost:3000):

```bash
cd backend && npm install && npm run start:dev
```

**Frontend** (http://localhost:5173, `/api` проксируется на backend):

```bash
cd frontend && npm install && npm run dev
```

## API

### POST /api/jobs

Создаёт задание и немедленно возвращает `id`. Обработка идёт в фоне.

```json
// Request body
{ "urls": ["https://example.com", "https://httpbin.org/status/404"] }

// Response 201
{ "id": "a1b2c3d4-e5f6-..." }
```

Ограничения: от 1 до 100 URL, только `http://` и `https://`.

### GET /api/jobs

Список заданий, отсортированный по дате создания (новые первые).

```json
[
  {
    "id": "a1b2c3d4-e5f6-...",
    "status": "in_progress",
    "createdAt": "2026-06-23T10:00:00.000Z",
    "totalUrls": 2,
    "successCount": 1,
    "errorCount": 0
  }
]
```

### GET /api/jobs/:id

Детали задания с прогрессом и результатами по каждому URL.

```json
{
  "id": "a1b2c3d4-e5f6-...",
  "status": "completed",
  "createdAt": "2026-06-23T10:00:00.000Z",
  "totalUrls": 2,
  "successCount": 1,
  "errorCount": 1,
  "progress": { "processed": 2, "total": 2 },
  "urls": [
    {
      "url": "https://example.com",
      "status": "success",
      "httpStatus": 200,
      "errorMessage": null,
      "durationMs": 312
    },
    {
      "url": "https://httpbin.org/status/404",
      "status": "success",
      "httpStatus": 404,
      "errorMessage": null,
      "durationMs": 198
    }
  ]
}
```

> HTTP 4xx считается успешным результатом — сервер ответил. `status: "error"` означает сетевую ошибку или таймаут.

### PATCH /api/jobs/:id/cancel

Отменяет задание. Возвращает `204 No Content`.

URL-адреса в статусе `pending` переходят в `cancelled` немедленно. Адреса в статусе `in_progress` дождутся завершения запроса и только после этого задание окончательно закроется.

---

**Статусы задания:** `pending` → `in_progress` → `completed` | `cancelled` | `failed`  
**Статусы URL:** `pending` → `in_progress` → `success` | `error` | `cancelled`

## Структура проекта

```
url-checker/
├── backend/src/
│   ├── jobs/
│   │   ├── domain/          # entities + фабрики
│   │   ├── dto/             # input/output контракты
│   │   ├── jobs.controller.ts
│   │   ├── jobs.mapper.ts   # entity → DTO
│   │   ├── jobs.module.ts
│   │   ├── jobs.processor.ts
│   │   ├── jobs.repository.ts
│   │   └── jobs.service.ts
│   └── shared/
│       ├── constants/
│       ├── enums/
│       └── utils/semaphore.ts
├── frontend/src/
│   ├── api/                 # fetch-обёртки
│   ├── components/
│   ├── store/               # Zustand + polling
│   ├── types/
│   └── utils/
├── nginx/nginx.conf
└── docker-compose.yml
```

## Архитектурные решения

**Fire-and-forget обработка.** `POST /api/jobs` возвращает `id` мгновенно, не дожидаясь проверки URL. Фронтенд получает результаты через polling `GET /api/jobs/:id` каждые 1.5 секунды. Альтернатива — WebSocket — избыточна для этого сценария.

**Semaphore вместо `Promise.all` с ограничением.** Для каждого задания создаётся независимый семафор на 5 слотов. Это значит: 5 параллельных HEAD-запросов на одно задание, независимо от того, сколько заданий выполняется одновременно.

**`pollToken` для отмены polling.** При переключении между заданиями токен инкрементируется. Устаревший цикл проверяет токен при каждом тике и завершается, если он изменился — без `AbortController` и сложного управления жизненным циклом.

**`assert` вместо `try/catch` в сервисах.** NestJS перехватывает исключения глобально. `assert(condition, new NotFoundException(...))` — это одна строка вместо трёх, и она явно выражает инвариант, а не сценарий обработки ошибки.

**In-memory хранилище.** Данные живут в `Map` внутри `JobsRepository`. При рестарте backend всё сбрасывается. Репозиторий изолирован за интерфейсом — замена на PostgreSQL потребует изменений только в одном файле.
