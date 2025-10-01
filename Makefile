diff --git a/Makefile b/Makefile
new file mode 100644
index 0000000..5f6d3c1
--- /dev/null
+++ b/Makefile
@@ -0,0 +1,30 @@
+PLAYWRIGHT_IMAGE = mcr.microsoft.com/playwright:v1.47.0-jammy
+WORKDIR = /work
+
+docker-run = docker run --rm -t \
+  -v "$$(pwd):$(WORKDIR)" -w "$(WORKDIR)" \
+  $(PLAYWRIGHT_IMAGE) bash -lc
+
+.PHONY: install
+install:
+	$(docker-run) "corepack enable && pnpm install --frozen-lockfile"
+
+.PHONY: e2e-build
+e2e-build:
+	$(docker-run) "pnpm -s e2e:build"
+
+.PHONY: visual-update
+visual-update:
+	$(docker-run) "pnpm -s e2e:build && pnpm -s visual:update"
+
+.PHONY: visual-test
+visual-test:
+	$(docker-run) "pnpm -s e2e:build && pnpm -s visual:test"
