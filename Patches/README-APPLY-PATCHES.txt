Patches 001–010 for the Admin Dashboard audit.

Apply with one of the following from your repo root (where this Patches/ folder lives):

Git Bash / macOS / Linux:
  git apply --index Patches/*.diff

PowerShell (Windows):
  git apply --index (Get-ChildItem -Path Patches -Filter *.diff | Sort-Object Name | ForEach-Object { $_.FullName })

If a patch fails due to context drift, apply them one-by-one:
  git apply --index Patches/001-sanitize-blog-content.diff
  git apply --index Patches/002-media-alt-text.diff
  ...

You can also open each diff and make the edits manually if needed.
