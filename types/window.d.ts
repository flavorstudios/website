import type { E2E_DASHBOARD_HISTORY } from "@/lib/e2e-fixtures";

declare global {
  interface Window {
    __dashboardHistoryDatasets?: typeof E2E_DASHBOARD_HISTORY;
  }
}

export {};