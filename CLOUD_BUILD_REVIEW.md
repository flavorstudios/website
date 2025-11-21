# Cloud Build review and recommendations

## Observations
- The repository does not contain a `cloudbuild.yaml`/`cloudbuild.json`. A Cloud Build trigger invoking `gcloud builds submit` without an explicit `--config` will default to Docker build behavior, but any trigger that expects a checked-in config will fail at build creation when the file is missing.
- The root `Dockerfile` builds the backend and shared packages with pnpm and targets the compiled backend entry point (`backend/dist/index.js`). It assumes the root workspace context and copies `pnpm-lock.yaml`, workspace manifests, and backend/shared sources. [See lines referenced below.]
- There is also a `backend/Dockerfile` that builds only the backend and shared packages inside the workspace. This is a slimmer context for Cloud Run-style deployments when the build context is the repo root. [See lines referenced below.]
- No `.dockerignore` file is present, so submitting the entire repository to Cloud Build will upload `node_modules`, test artifacts, and other bulky directories. This increases build creation latency and can cause build creation to fail if the source archive exceeds limits.
- No infrastructure-as-code files in the repo configure Cloud Build service accounts or triggers, so IAM/trigger setup likely happens externally.

## Likely root causes for `CloudBuild.CreateBuild` errors
1. **Missing build config file** – If your trigger or `gcloud builds submit --config cloudbuild.yaml` expects `cloudbuild.yaml` in the repo, build creation fails because the file is absent.
2. **Insufficient IAM on caller or Cloud Build service account** – The identity calling `projects.builds.create` needs `roles/cloudbuild.builds.editor` (or higher) on the project. If using a Cloud Build trigger, the connected service account must have this role plus any deploy roles (e.g., Artifact Registry, Cloud Run). A permission denial surfaces as a `CloudBuild.CreateBuild` error.
3. **Oversized or slow source upload** – Without `.dockerignore`, the default source tarball can include `node_modules`, `test-results`, and `storybook` output. Large uploads sometimes time out before the build is created, yielding creation errors.
4. **Wrong Dockerfile path for trigger** – If your trigger points at the root `Dockerfile` but the intended runtime is the backend-only image, the build can fail when pnpm workspace filters differ across Dockerfiles (e.g., `pnpm install --filter next-backend...` in `backend/Dockerfile`). Using the wrong Dockerfile or missing workspace filters can cause build failures during dependency resolution.

## Recommendations
- Add an explicit `cloudbuild.yaml` that builds and pushes the backend image using the correct Dockerfile. Example is provided below.
- Create a `.dockerignore` to exclude `node_modules`, test artifacts, coverage, `.git`, and local tooling caches to speed uploads and prevent archive bloat.
- Verify IAM: ensure the trigger service account (or user) has `roles/cloudbuild.builds.editor` and that the Cloud Build service account has permissions for Artifact Registry/Cloud Run deploys. Document the expected service accounts.
- Align triggers to the correct Dockerfile (`backend/Dockerfile` for backend-only builds) and specify the `--file` and `--tag` arguments in `cloudbuild.yaml` to avoid ambiguity.

## Example `cloudbuild.yaml`
```yaml
steps:
  - name: gcr.io/cloud-builders/docker
    args:
      ["build", "-f", "backend/Dockerfile", "-t", "${_IMAGE_URI}", "."]
images:
  - "${_IMAGE_URI}"
substitutions:
  _IMAGE_URI: "us-central1-docker.pkg.dev/$PROJECT_ID/website/backend:latest"
options:
  machineType: E2_HIGHCPU_8
```

## Suggested `.dockerignore`
```
node_modules
npm-debug.log
yarn-error.log
pnpm-debug.log
.git
.firebase
storybook-static
test-results
e2e
coverage
.tmp
**/.turbo
```