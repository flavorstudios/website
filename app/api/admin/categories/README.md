# Admin Category API

This directory exposes endpoints for managing blog and video categories.

## Sync

`POST /api/admin/categories/sync` ensures `content-data/categories.json` exists.
If no categories are found, it restores from `content-data/categories-default.json`
when that file is available. When the default file is missing, an empty
categories file is generated instead.
