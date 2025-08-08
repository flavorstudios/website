# Media Components

## Component Props

### `MediaGrid`
| Prop | Type | Description |
| --- | --- | --- |
| `items` | `MediaDoc[]` | Items to display. |
| `onSelect` | `(item: MediaDoc) => void` | Called when an item is selected. |
| `onPick?` | `(url: string) => void` | Optional callback when an item is picked. |
| `selected?` | `Set<string>` | Set of selected item IDs. |
| `toggleSelect?` | `(id: string) => void` | Toggle item selection for bulk actions. |

### `DetailsPanel`
_Alias of `MediaDetailsDrawer`_
| Prop | Type | Description |
| --- | --- | --- |
| `media` | `MediaDoc` | Item to show/edit. |
| `open` | `boolean` | Whether the panel is visible. |
| `onClose` | `() => void` | Close handler. |

### `UploadBar`
_Alias of `MediaUpload`_
| Prop | Type | Description |
| --- | --- | --- |
| `onUploaded` | `(item: MediaDoc) => void` | Called after a file uploads successfully. |

### `FiltersBar`
_Alias of `MediaToolbar`_
| Prop | Type | Description |
| --- | --- | --- |
| `search` | `string` | Current search query. |
| `onSearchChange` | `(val: string) => void` | Update search query. |
| `typeFilter` | `string` | MIME type prefix filter. |
| `onTypeFilter` | `(val: string) => void` | Change type filter. |
| `sortBy` | `string` | Sort key (`date` \| `name`). |
| `onSortBy` | `(val: string) => void` | Change sort key. |
| `view` | `'grid' | 'list'` | Current layout view. |
| `onToggleView` | `() => void` | Switch between grid and list views. |

### `BulkActions`
_Alias of `MediaBulkActions`_
| Prop | Type | Description |
| --- | --- | --- |
| `count` | `number` | Number of selected items. |
| `onDelete` | `() => void` | Delete handler for selected items. |
| `onTag` | `() => void` | Tag editing handler. |
| `onDownload` | `() => void` | Download handler. |

### `SelectionModal`
_Alias of `MediaPickerDialog`_
| Prop | Type | Description |
| --- | --- | --- |
| `open` | `boolean` | Whether the dialog is open. |
| `onOpenChange` | `(open: boolean) => void` | Callback when dialog visibility changes. |
| `onSelect` | `(url: string) => void` | Called with the picked media URL. |

## API Endpoints (OpenAPI)
```yaml
openapi: 3.0.0
info:
  title: Media API
  version: '1.0'
paths:
  /api/media/list:
    get:
      summary: List media items
      parameters:
        - in: query
          name: cursor
          schema:
            type: integer
          required: false
      responses:
        '200':
          description: Media items
          content:
            application/json:
              schema:
                type: object
                properties:
                  media:
                    type: array
                    items:
                      $ref: '#/components/schemas/MediaDoc'
                  cursor:
                    type: integer
  /api/media/upload:
    post:
      summary: Upload a new media file
      responses:
        '200':
          description: Uploaded item
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MediaDoc'
  /api/media/update:
    post:
      summary: Update media metadata
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                id:
                  type: string
                tags:
                  type: array
                  items:
                    type: string
      responses:
        '200': { description: Updated }        
  /api/media/delete:
    post:
      summary: Delete a media item
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                id:
                  type: string
      responses:
        '200': { description: Deleted }
  /api/media/replace:
    post:
      summary: Replace the file for a media item
      responses:
        '200': { description: Replaced }
  /api/media/edit:
    post:
      summary: Edit media details such as alt text
      responses:
        '200': { description: Edited }
  /api/media/attach:
    post:
      summary: Attach media to another resource
      responses:
        '200': { description: Attached }
  /api/media/detach:
    post:
      summary: Detach media from a resource
      responses:
        '200': { description: Detached }
components:
  schemas:
    MediaDoc:
      type: object
      properties:
        id:
          type: string
        url:
          type: string
        filename:
          type: string
        mime:
          type: string
        createdAt:
          type: integer
        size:
          type: integer
```

## MDX Examples

### Blog Editor Integration
```mdx
import MediaPickerDialog from '@/app/admin/dashboard/components/media/MediaPickerDialog';

<BlogEditor>
  <MediaPickerDialog open={pickerOpen} onOpenChange={setPickerOpen} onSelect={(url) => editor.chain().focus().setImage({ src: url }).run()} />
</BlogEditor>
```

### Video Editor Integration
```mdx
import MediaPickerDialog from '@/app/admin/dashboard/components/media/MediaPickerDialog';

<VideoEditor>
  <MediaPickerDialog open={pickerOpen} onOpenChange={setPickerOpen} onSelect={(url) => addVideo(url)} />
</VideoEditor>
```