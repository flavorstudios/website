import { render, screen } from "@testing-library/react";
import React from "react";

import { SECTION_HEADINGS } from "@/app/admin/dashboard/section-metadata";

import "./helpers/mock-admin-dashboard";

describe("AdminDashboardPageClient heading structure", () => {
  beforeEach(() => {
    jest.resetModules();
    (global.fetch as unknown) = jest.fn(() =>
      Promise.resolve({ ok: true, json: async () => ({}) })
    );
  });

  it("renders exactly one h1 for the overview section", async () => {
    const { default: AdminDashboardPageClient } = await import(
      "@/app/admin/dashboard/AdminDashboardPageClient"
    );

    render(<AdminDashboardPageClient initialSection="overview" />);

    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(SECTION_HEADINGS.overview);
  });

  it("can defer the heading to the parent when suppressed", async () => {
    const { default: AdminDashboardPageClient } = await import(
      "@/app/admin/dashboard/AdminDashboardPageClient"
    );

    render(
      <>
        <h1 id="custom-heading">Dashboard Override</h1>
        <AdminDashboardPageClient
          initialSection="overview"
          suppressHeading
          headingId="custom-heading"
        />
      </>
    );

    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent("Dashboard Override");
  });
});