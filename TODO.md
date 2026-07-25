# Deployment Fix: GitHub Pages Subpath Resolution

## Steps

- [x] 1. Analyze all path references in `app.js` that need base-path prefixing
- [x] 2. Add `__BASE` auto-detection at top of IIFE in `app.js`
- [x] 3. Update `dataUrl` to use `__BASE`
- [x] 4. Update `/api/gallery` and `/api/admission` fetch URLs to use `__BASE`
- [x] 5. Update level page route links (`/levels/${slug}` → `${__BASE}/levels/${slug}`)
- [x] 6. Update `homePath` computation to use `__BASE`
- [x] 7. Update route matching in `render()` and `levelPage()` to strip `__BASE` prefix
- [x] 8. Update back-home and navigation links to use `__BASE`
- [x] 9. Update `location.pathname` checks in event handlers and popstate
- [x] 10. `.nojekyll` file created (already exists)
- [ ] 11. Commit and push changes to GitHub
- [ ] 12. Guide user to enable GitHub Pages in repo Settings

