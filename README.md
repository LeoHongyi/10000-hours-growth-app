# 10000 Hours Growth App

A warm, mobile-first web app for a two-adult household to track learning hours, reduce procrastination, and keep a simple family diary.

This MVP is built as a local-first single-page app. It focuses on three daily loops:
- set yearly learning goals,
- record focused study time with as little friction as possible,
- keep a light baby growth diary with a photo and one sentence.

## Product direction

The app combines a family-journal feel with structured time tracking inspired by the 10,000-hour idea.

Core product goals:
- track yearly goals such as Montessori study or IELTS prep,
- break goals into smaller tasks,
- start and stop a timer for real study sessions,
- add manual records when needed,
- generate simple daily and weekly plan suggestions,
- celebrate milestones,
- keep a family diary entry point close to the main workflow.

## Implemented MVP features

### 1. Household onboarding
- first-run setup for two adults
- trimmed input handling
- validation that blocks incomplete setup

### 2. Home dashboard
- weekly family study total
- daily suggestion cards
- quick-start action for the current suggestion
- goal progress preview
- diary shortcut from the home screen

### 3. Goals and progress
- create yearly goals per adult
- split goals into task items
- active / inactive goal toggle
- grouped goal list by household member
- goal detail page with task-level quick actions
- progress bar and remaining-hours feedback

### 4. Records and timer flow
- start a timer from an active goal or task
- pause / resume / finish timer sessions
- automatic duration calculation on finish
- optional note on completion
- manual record entry with validation
- recent study record list
- active timer persistence through local storage

### 5. Plans page
- daily plan suggestions generated from goal progress and inactivity
- weekly framework suggestions for the upcoming week
- mark a plan item complete
- skip a plan item
- replace a plan item with another suggestion
- monthly invested time summary

### 6. Milestones
- milestone detection at fixed thresholds:
  - 10h
  - 50h
  - 100h
  - 200h
  - 300h
  - 500h
- modal celebration with supportive copy
- milestone persistence in local storage layer

### 7. Family diary
- date + one-sentence diary entry
- optional photo upload
- client-side image compression before save
- reverse chronological diary feed

### 8. Integration coverage
- onboarding-to-home integration test
- focused unit and component tests for the main flows
- production build verification

## Current app structure

Routes currently implemented:
- `/` — home dashboard
- `/goals` — goal list
- `/goals/:goalId` — goal detail
- `/records` — timer and manual records
- `/plans` — plans page
- `/diary` — family diary

## Technical implementation

### Frontend
- React 19
- TypeScript
- Vite
- React Router

### State and persistence
- single `AppProvider` as the app state boundary
- IndexedDB via `idb` for persistent app data
- `localStorage` for active timer recovery

### Data persisted locally
- members
- goals
- tasks
- study records
- plan items
- milestone records
- diary entries

### Test stack
- Vitest
- React Testing Library
- fake-indexeddb
- jsdom

## Local-first architecture

This app currently has no login and no backend.

All user data stays in the browser for the MVP:
- IndexedDB stores the main application data
- `localStorage` stores the active timer snapshot for refresh recovery

That keeps the app fast, simple, and easy to iterate on for the first version.

## Development

### Install
```bash
npm install
```

### Start the dev server
```bash
npm run dev
```

### Run tests
```bash
npm run test -- --run
```

### Run a production build
```bash
npm run build
```

### Automatic deployment

GitHub Actions deploys this app to the existing Cloudflare Pages project `10000-hours-growth-app`
when changes are pushed to `bootstrap/base`.

Required GitHub repository secrets:
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

The workflow runs `npm ci`, `npm test -- --run`, `npm run build`, then deploys `dist` to Cloudflare Pages.

### Product hardening

Production readiness additions:
- PWA metadata, install icon, and a lightweight service worker
- local JSON backup export and import restore
- local data clear flow with confirmation
- standalone privacy policy route at `/privacy`
- global error boundary with a reload recovery path
- IndexedDB schema version constant and migration entry point
- ESLint flat config for the current ESLint release

Design references downloaded from Stitch are archived in `docs/design/stitch-assets`.

## Project status

This repository currently contains a working MVP with:
- household onboarding,
- goals,
- timer + manual record flow,
- daily and weekly planning,
- milestones,
- family diary,
- integration test coverage.

Current scope is browser-local only. Sync, auth, and shared cloud storage are not part of this version.

## Notes

- The app is designed mobile-first.
- The UI style uses warm beige / yellow tones and rounded cards to keep the family-journal feeling.
- The repository currently uses the branch `bootstrap/base` for the active implementation work.
