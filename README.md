# lite-starter

TanStack Start, Tailwind CSS, and shadcn/ui on Cloudflare Workers.

```bash
bun install
bun run dev        # http://localhost:3000
bun run build
bun run deploy
```

Preview a change without touching production:

```bash
bun run deploy:preview                            # https://<version>-melhamy.<subdomain>.workers.dev
bun run deploy:preview -- --preview-alias my-pr   # https://my-pr-melhamy.<subdomain>.workers.dev
```

Add a shadcn component:

```bash
pnpm dlx shadcn@latest add button
```
