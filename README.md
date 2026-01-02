# Vigilant Monitor

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/singhkunal9442-design/vigilant-enterprise-website-monitoring-platform)

A production-ready full-stack chat application built on Cloudflare Workers with Durable Objects for stateful entities (Users, Chats, Messages). Features a modern React frontend with shadcn/ui, Tailwind CSS, and Tanstack Query for seamless real-time data management.

## Features

- **Serverless Backend**: Hono-based API with Durable Objects for multi-tenant storage (one DO per entity).
- **Indexed Entities**: Automatic listing, pagination, CRUD operations for Users and ChatBoards.
- **Real-time Chat**: Persistent messages per chat, indexed for efficient queries.
- **Modern UI**: Responsive design with dark/light themes, sidebar layout, and polished components.
- **Type-Safe**: Full TypeScript end-to-end with shared types.
- **Optimizations**: CAS-based optimistic updates, batch operations, prefix indexes.
- **Deployment Ready**: One-click deploy to Cloudflare Workers with SPA asset handling.

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, Tanstack Query, React Router, Framer Motion, Sonner (toasts), Lucide Icons.
- **Backend**: Cloudflare Workers, Hono, Durable Objects (GlobalDurableObject), SQLite storage.
- **State Management**: Immer (via Tanstack Query), Zustand-ready.
- **Tools**: Bun (package manager), Wrangler, ESLint, Tailwind Animate.

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (v1.0+)
- [Cloudflare Wrangler](https://developers.cloudflare.com/workers/wrangler/install-update/) (optional for local dev/deploy)
- Cloudflare account (free tier sufficient)

### Installation

```bash
bun install
```

### Development

Start the dev server (proxies API to Workers):

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) (or your configured port).

Generate Worker types (if needed):

```bash
bun cf-typegen
```

### Build

```bash
bun build
```

Outputs to `dist/` for preview:

```bash
bun preview
```

### Deployment

1. **Login to Cloudflare**:
   ```bash
   wrangler login
   ```

2. **Deploy**:
   ```bash
   bun deploy
   ```
   (Alias for `bun build && wrangler deploy`)

3. **One-Click Deploy**:
   [![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/singhkunal9442-design/vigilant-enterprise-website-monitoring-platform)

**Note**: Ensure `wrangler.jsonc` has your project name and bindings configured. Durable Objects auto-migrate on first deploy.

## API Reference

All endpoints under `/api/` with JSON responses `{ success: boolean; data?: T; error?: string }`.

### Users
- `GET /api/users?cursor=&limit=` - Paginated list.
- `POST /api/users` - `{ name: string }` → Create user.
- `DELETE /api/users/:id`
- `POST /api/users/deleteMany` - `{ ids: string[] }`

### Chats
- `GET /api/chats?cursor=&limit=` - Paginated list.
- `POST /api/chats` - `{ title: string }` → Create chat.
- `DELETE /api/chats/:id`
- `POST /api/chats/deleteMany` - `{ ids: string[] }`

### Messages
- `GET /api/chats/:chatId/messages` - List messages.
- `POST /api/chats/:chatId/messages` - `{ userId: string; text: string }` → Send message.

Health: `GET /api/health`

Client errors: `POST /api/client-errors`

## Project Structure

```
├── src/                 # React frontend (Vite)
├── worker/              # Cloudflare Worker (Hono + Durable Objects)
├── shared/              # Shared types/mock data
├── tailwind.config.js   # UI theming
└── wrangler.jsonc      # Workers config
```

## Customization

- **Entities**: Extend `IndexedEntity` in `worker/entities.ts`, add routes in `worker/user-routes.ts`.
- **UI**: Edit `src/pages/HomePage.tsx` or add routes in `src/main.tsx`. Use shadcn components.
- **Sidebar**: Customize `src/components/app-sidebar.tsx` or remove `AppLayout`.
- **API Client**: Extend `src/lib/api-client.ts`.

**DO NOT** modify `worker/core-utils.ts`, `worker/index.ts`, or `wrangler.jsonc` core logic.

## Local Worker Testing

```bash
wrangler dev --remote  # Test against real Durable Objects
```

## Contributing

1. Fork & clone.
2. `bun install`.
3. `bun dev`.
4. Submit PR.

## License

MIT. See [LICENSE](LICENSE) for details.