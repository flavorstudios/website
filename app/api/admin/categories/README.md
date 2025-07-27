# Admin Category API

This directory exposes endpoints for managing blog and video categories.

---

## Sync

`POST /api/admin/categories/sync` ensures that `content-data/categories.json` exists and is populated.  
- If `categories.json` is missing or empty, it will restore from `content-data/categories-default.json` (if present).  
- If the default file is missing, it creates a minimal `categories.json` with empty blog and watch arrays.

---

## Default Categories

You can supply `content-data/categories-default.json` to provide fallback category data.  
The `sync` route copies this file to `categories.json` **only when** no categories are present.

You can edit the supplied file or create your own.  
**Required structure:**

```json
{
  "CATEGORIES": {
    "blog": [
      {
        "id": "sample-blog-category",
        "slug": "general",
        "title": "General",
        "description": "Sample blog category",
        "isActive": true,
        "order": 1,
        "postCount": 0
      }
    ],
    "watch": [
      {
        "id": "sample-video-category",
        "slug": "videos",
        "title": "Videos",
        "description": "Sample video category",
        "isActive": true,
        "order": 1,
        "postCount": 0
      }
    ]
  }
}
