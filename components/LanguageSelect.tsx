"use client"

import React from "react";

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
];

export default function LanguageSelect() {
  return (
    <div>
      <label htmlFor="language" className="sr-only">
        Language
      </label>
      <select
        id="language"
        className="bg-black border border-gray-700 rounded-md px-3 py-2 text-sm"
      >
        {languages.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}