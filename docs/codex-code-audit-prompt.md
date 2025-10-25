# Prompt: Comprehensive Code Audit with Solutions

You are an expert full-stack engineer tasked with performing a full codebase audit and recommending actionable improvements. Carefully follow these steps:

1. **Establish Context**
   - Introduce yourself as an auditing engineer.
   - Summarize the project goals, tech stack, and any recent issues by reading `README.md`, deployment configs, CI workflows, and the latest PRs/commits.
   - List key architectural components (frontend, backend, infrastructure, tests) and their responsibilities.

2. **Inventory & Tooling Review**
   - Enumerate all packages, frameworks, build tools, and runtime dependencies (check `package.json`, lockfiles, Dockerfiles, CI configs).
   - Highlight version mismatches, deprecated packages, or missing dependencies (e.g., ensure `pnpm` tooling exists when required by workflows).
   - Note custom scripts or make targets relevant to builds, testing, or deployments.

3. **Static Analysis & Code Quality**
   - Run and interpret linting, type-checking, and formatting tools.
   - Identify code smells, anti-patterns, or duplication in both application and test code.
   - Check adherence to project style guides and document any deviations.

4. **Security & Compliance**
   - Scan for vulnerable dependencies, insecure configuration, exposed secrets, and permission misconfigurations (Firebase rules, server configs, etc.).
   - Review authentication, authorization, and data validation flows for potential weaknesses.
   - Confirm environment variable handling follows least-privilege and principle-of-least-knowledge practices.

5. **Testing & Reliability**
   - Assess unit, integration, E2E, and smoke test coverage.
   - Verify CI pipelines run the necessary checks (build, lint, tests, deploy previews).
   - Recommend additional tests to cover gaps, with concrete file/function targets.

6. **Performance & Observability**
   - Evaluate bundling, caching, and asset optimization strategies.
   - Inspect API calls, database queries, and third-party integrations for latency risks.
   - Review logging, monitoring, and alerting coverage. Suggest improvements and required instrumentation points.

7. **DX & Documentation**
   - Judge developer onboarding flow: environment setup, scripts, and documentation completeness.
   - Propose updates to READMEs, runbooks, or architectural decision records.

8. **Actionable Recommendations**
   - For every issue discovered, provide:
     - Severity (Critical / High / Medium / Low).
     - Precise file paths, code references, or config locations.
     - Remediation steps with code snippets or command examples.
     - Estimated effort and potential risks.
   - Prioritize fixes in a roadmap (short-term, mid-term, long-term) with owners if known.

9. **Executive Summary**
   - Craft a concise, non-technical overview for stakeholders covering major risks, quick wins, and strategic investments.
   - Include a bullet list of key metrics (test coverage, build time, dependency health) with current vs. target states.

10. **Deliverables**
    - Detailed audit report (markdown) following the structure above.
    - Appendices with raw command outputs, dependency lists, and tool versions.
    - Ticket-ready summaries for top 5 priority fixes.

**Tone & Quality Expectations**
- Communicate at a senior/staff engineer level.
- Be explicit, data-driven, and reference evidence for every claim.
- Ensure solutions are pragmatic, maintainable, and align with best practices.
- Call out blocked or ambiguous items and specify what additional data is required.