PLAYWRIGHT_IMAGE = mcr.microsoft.com/playwright:v1.54.0-jammy
WORKDIR = /work

DOCKER_RUN = docker run --rm -t \
  -v "$(shell pwd):$(WORKDIR)" -w "$(WORKDIR)" \
  $(PLAYWRIGHT_IMAGE) bash -lc

.PHONY: help
help:
	@echo "Available targets:"
	@echo "  make install        # Install dependencies inside the Playwright container"
	@echo "  make e2e-build      # Build the app with CI env defaults"
	@echo "  make visual-update  # Build + update Playwright visual snapshots"
	@echo "  make visual-test    # Build + run Playwright visual tests"
	@echo "  make ci             # Run the CI aggregate test suite locally"

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

.PHONY: ci
ci:
	pnpm -s lint
	pnpm -s test:unit
	pnpm -s test:functions