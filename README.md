# Character Explorer (Angular 19)

A small app to explore Rick & Morty characters, built with **Angular 19** and **Angular Material** using the public [Rick & Morty API](https://rickandmortyapi.com/).

## Features
- Characters page with **List (table) view** and **Grid (card) view**
- Global search bar to filter characters by name
- Character details page with an episodes table (name, air date, episode) and a client-side filter
- Two roles, **Admin** and **Viewer** (hardcoded, switch from the toolbar dropdown)
  - Admin can open every page
  - Viewer can only see the characters list. If a Viewer opens a details page, a snackbar shows "Access denied" and they are sent back to the list
- Friendly error messages (snackbar) when an API call fails

## Tech used
Angular 19 (standalone components, signals, new control flow), Angular Material, RxJS, TypeScript.

## Getting started

### 1. What you need
- [Node.js](https://nodejs.org/) 18.19 or newer (Node 20 or 22 is recommended)
- npm (comes with Node)
- Git

### 2. Install and run
```bash
# get the code
git clone https://github.com/ShivaKumar1614/Character-Explorer_Angular-19.git
cd Character-Explorer_Angular-19

# install packages
npm install

# start the app
npm start
```
Open http://localhost:4200 in your browser. The page reloads when you change a file.

### 3. Build for production (optional)
```bash
npm run build
```
The output is created in the `dist/` folder.

### 4. Try the roles
Use the **Admin / Viewer** dropdown in the top bar.
1. As **Admin**, click any character to open its details and episodes.
2. Switch to **Viewer** and click a character. You will see an access denied message and stay on the list.

## Project structure
```
src/app
├── core      services (API, search, auth, snackbar), role guard, HTTP interceptor, models
├── shared    common table and common paginator (reused on both pages)
└── features     characters page (list/grid) and character details page
```

## Rationale for my solution / decisions

**Technology and structure.** I used Angular 19 with Angular Material because the task asked for the latest Angular features, and Material already gives clean, ready-made tables, paginators, cards, toggles and snackbars, so I did not need to build or style them myself. Signals hold simple screen state like the current page, loading flag and list/grid choice, while RxJS handles search and API calls, because it can wait after typing (`debounceTime`) and cancel old requests (`switchMap`). `takeUntilDestroyed()` closes every subscription automatically, so there are no memory leaks. To avoid repeating code, I built one common table driven by column definitions, used by both the characters list and the episodes list. An `enableFilter` switch turns the table's own filter on for episodes (client-side filtering, as required) and off for characters, which use the global search instead. The same table can page data from the server (characters, 20 per page) or in the browser (episodes), and the characters page offers both list and grid views so users can pick what suits them.

**Access control, errors and simplicity.** A route guard checks a hardcoded role, switched from the toolbar dropdown. A Viewer who tries to open a details page gets an "Access denied" snackbar and is sent back to the characters list. One HTTP interceptor shows a friendly error message for failed API calls, so no page repeats that code, and it ignores 404 because this API uses it to mean "no results". I kept the code beginner-friendly on purpose: inline templates, clear folders (`core`, `shared`, `features`) and short comments. I also left out heavier tools like state libraries, lazy loading and experimental APIs, because they would make a small app harder to read without making it work better. As an optional extra, the search text is kept in a shared service, so it is still there when you go to a details page and come back.
