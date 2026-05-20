# infomarket.ai demo deployment

## Railway

The project is ready for Railway deployment.

```bash
railway up
```

Required environment variables:

```bash
API_SPORTS_KEY=your_api_sports_key_here
NODE_ENV=production
```

Railway uses `railway.json` and `npm start`.

## Render

Use the included `render.yaml` as a Blueprint. The service runs:

```bash
npm start
```

Set `API_SPORTS_KEY` in the Render dashboard if live football logos/results are needed.

## Fly.io

The included `Dockerfile` and `fly.toml` are ready for:

```bash
fly deploy
```

Set secrets with:

```bash
fly secrets set API_SPORTS_KEY=your_api_sports_key_here
```

## Temporary Cloudflare preview

For quick overseas review without platform login:

```bash
npx cloudflared tunnel --url http://127.0.0.1:5173
```

This creates a temporary `trycloudflare.com` URL. It is useful for demos, not production.
