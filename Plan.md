# Mobile-First Refactor Plan

- Breakpoints: 320, 375, 768, 1024, 1280, 1536
- Sidebar becomes drawer with focus trap on <768px.
- Bottom tab bar provides access to Dashboard, Media, Users, Settings on mobile.
- Tables (media, blogs) render card lists on small screens.
- Touch targets use `h-14` or `min-h-11` ensuring at least 44px.
- Future work: convert remaining tables to cards, audit remaining icons, improve performance with route-level code splitting.