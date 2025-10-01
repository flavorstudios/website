PLAYWRIGHT_IMAGE = mcr.microsoft.com/playwright:v1.54.0-jammy
WORKDIR = /work

DOCKER_RUN = docker run --rm -t \
  -v "$(shell pwd):$(WORKDIR)" -w "$(WORKDIR)" \
  $(PLAYWRIGHT_IMAGE) bash -lc

.PHONY: install
install:
	$(DOCKER_RUN) "corepack enable && pnpm install --frozen-lockfile"

.PHONY: e2e-build
e2e-build:
	$(DOCKER_RUN) "pnpm -s e2e:build"

.PHONY: visual-update
visual-update:
	$(DOCKER_RUN) "pnpm -s e2e:build && pnpm -s visual:update"

.PHONY: visual-test
visual-test:
	$(DOCKER_RUN) "pnpm -s e2e:build && pnpm -s visual:test"