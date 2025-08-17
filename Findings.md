# Prioritised Findings Status

## P0
1. **Unsanitised blog HTML enables XSS** – Fixed (components/BlogPostRenderer.tsx)

## P1
2. **Media library thumbnails lack descriptive alt text** – Fixed (MediaList.tsx)
3. **Clickable table rows are non-semantic** – Fixed (MediaList.tsx & BlogTable.tsx card view)
4. **Category icons exposed to screen readers** – Fixed (CategoryList.tsx)
5. **Table headers lack scope attributes** – Fixed (BlogTable.tsx)
6. **Featured-image preview bypasses optimisation** – Fixed (BlogTable.tsx)
7. **Error messages are not announced** – Fixed (EmailLoginForm.tsx)
8. **Sidebar toggle references a non-landmark wrapper** – Fixed (AdminSidebar/AdminLayout)

## P2
9. **Quick-actions file lacks terminating newline** – Fixed
10. **Toasts lack placement/config for accessibility** – Fixed (components/ui/toaster.tsx)