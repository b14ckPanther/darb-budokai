# budokai-web

The Darb Budokai client: Angular 19 (standalone components, signals). Phase 0 holds only a
branded shell; the design system arrives in Phase 2 and the screens in Phase 3.

Node 22 (see `.nvmrc`). From the repo root:

```bash
npm --prefix web/budokai-web ci
npm --prefix web/budokai-web start        # http://localhost:4200
npm --prefix web/budokai-web run lint     # angular-eslint + Prettier check
npm --prefix web/budokai-web test         # Jest unit tests
npm --prefix web/budokai-web run e2e      # Playwright + axe (starts ng serve)
npm --prefix web/budokai-web run build
```

Brand colours and the seal come straight from `brand/exports/` (wired in `angular.json`);
the fonts in `public/fonts/` are Latin subsets of the brand fonts (SIL OFL, licences alongside).
