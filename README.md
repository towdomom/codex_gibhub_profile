# Dev Portfolio (GitHub Pages)

Static single-page developer portfolio with KO/EN toggle and JSON-driven content.

## Run locally

```powershell
cd C:\AI_Code\codex_gibhub_profile
python -m http.server 4173 --bind 127.0.0.1
```

Open: `http://127.0.0.1:4173`

## Edit content

Update [assets/data/portfolio.json](C:\AI_Code\codex_gibhub_profile\assets\data\portfolio.json):

- `profile`: name, title, summary, about, strengths, contacts
- `projects[]`: problem/role/solution/impact, stack, links
- `skills`: frontend/backend/tools/levels
- `analytics`: set `enabled=true` and provider fields when needed

## GitHub Pages deploy

`main` branch push triggers `.github/workflows/deploy-pages.yml`.

GitHub repository settings:

1. `Settings -> Pages`
2. `Build and deployment -> Source: GitHub Actions`
