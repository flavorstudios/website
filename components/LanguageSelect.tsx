"use client"

import React from "react";
import { locales } from "@/i18n"; // Make sure this path matches your project structure

export default function LanguageSelect() {
  return (
    <div>
      <label htmlFor="language-select" className="sr-only">
        Language
      </label>
      <select
        id="language-select"
        aria-label="Select language"
        className="bg-black border border-gray-700 rounded-md px-3 py-2 text-sm"
      >
        {locales.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
