# Everend Compendium

Everend Compendium turns a WorldNotion vault and PathBranching's saved stories into a public static reading site. Canon Markdown remains the source of truth; the Compendium never writes during builds.

## Use

```sh
npm install
npm run init -- /path/to/universe
npm run build -- /path/to/universe --out=dist
npm run dev -- /path/to/universe
npm run export:markdown -- /path/to/universe --out=wiki-export
```

The optional `.everend/compendium.yaml` sets the site title, visual theme, navigation order, and publishable statuses. `canon` is the default. The reader projects only PathBranching story, sequence, event, text, description, and canon references; it deliberately omits choices, conditions, variables, consequences, and graph state.

`dist/` is ordinary static HTML and can be hosted on GitHub Pages, Cloudflare Pages, Netlify, or any static host. `export:markdown` produces a portable Markdown bundle and manifest for other wiki tools.

## Development

```sh
npm run typecheck
npm run lint
npm run format:check
npm test
```

The synthetic fixture under `tests/fixtures/vault` is also the GitHub Pages demo source.
