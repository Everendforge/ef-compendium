# Everend Compendium

Everend Compendium turns a WorldNotion vault and PathBranching's saved stories into a public static reading site. Canon Markdown remains the source of truth; the Compendium never writes during builds.

## Use

```sh
npm install
npm run init -- /path/to/universe
npx tsx cli/cli.ts build /path/to/universe --out=dist
npm run site:dev -- /path/to/universe
npx tsx cli/cli.ts markdown /path/to/universe --out=wiki-export
```

The optional `.everend/compendium.yaml` sets the site title, visual theme, navigation order, and publishable statuses. `canon` is the default. The reader projects only PathBranching story, sequence, event, text, description, and canon references; it deliberately omits choices, conditions, variables, consequences, and graph state.

`dist/` is ordinary static HTML and can be hosted on GitHub Pages, Cloudflare Pages, Netlify, or any static host. `export:markdown` produces a portable Markdown bundle and manifest for other wiki tools.

## Desktop reader

`npm run tauri:dev` opens the Tauri reader. Alongside the reading and story views, it offers an interactive relationship graph, a chronology, and an atlas.

The chronology is opt-in: add `date: "Year 1024"` or `start:` / `end:` to an entity's frontmatter. Entries without a date remain valid canon pages and simply do not appear in the timeline.

Maps are opt-in too. Create a published entity with `type: Map` and embed its image in the Markdown body. Pin an entity with `map: <map-id>`, `mapX: <0-100>`, and `mapY: <0-100>` in its frontmatter. These extra fields are additive and remain compatible with the v0.1 vault format.

## Development

```sh
npm run typecheck
npm run lint
npm run format:check
npm test
```

The synthetic fixture under `tests/fixtures/vault` is also the GitHub Pages demo source.
