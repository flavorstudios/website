"use client";
import AdminPageHeader from "@/components/AdminPageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useState } from "react";

interface Props {
  search: string;
  onSearchChange: (val: string) => void;
  typeFilter: string;
  onTypeFilter: (val: string) => void;
  sortBy: string;
  onSortBy: (val: string) => void;

  month: string;
  onMonth: (val: string) => void;
  year: string;
  onYear: (val: string) => void;
  size: string;
  onSize: (val: string) => void;
  attached: string;
  onAttached: (val: string) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;

  view: "grid" | "list";
  onToggleView: () => void;
}

export default function MediaToolbar({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilter,
  sortBy,
  onSortBy,
  month,
  onMonth,
  year,
  onYear,
  size,
  onSize,
  attached,
  onAttached,
  tags,
  onTagsChange,
  view,
  onToggleView,
}: Props) {
  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      onTagsChange([...tags, t]);
    }
    setTagInput("");
  };

  return (
    <div className="space-y-4 mb-4">
      <AdminPageHeader
        title="Media Library"
        subtitle="Manage and organize your uploaded media files"
      />
      <div className="flex items-center flex-wrap gap-2">
        {/* Search */}
        <Input
          placeholder="Search"
          aria-label="Search media"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-48"
        />

        {/* Type */}
        <Select value={typeFilter} onValueChange={onTypeFilter}>
          <SelectTrigger className="w-36" aria-label="Filter by type">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="application">Documents</SelectItem>
            <SelectItem value="image/svg">SVG</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={onSortBy}>
          <SelectTrigger className="w-36" aria-label="Sort by">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>

        {/* Month */}
        <Select value={month} onValueChange={onMonth}>
          <SelectTrigger className="w-32" aria-label="Filter by month">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Any Month</SelectItem>
            {Array.from({ length: 12 }, (_, i) => (
              <SelectItem key={i + 1} value={String(i + 1)}>
                {new Date(0, i).toLocaleString(undefined, { month: "long" })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Year */}
        <Select value={year} onValueChange={onYear}>
          <SelectTrigger className="w-28" aria-label="Filter by year">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Any Year</SelectItem>
            {Array.from({ length: 6 }, (_, i) => {
              const y = new Date().getFullYear() - i;
              return (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {/* Size */}
        <Select value={size} onValueChange={onSize}>
          <SelectTrigger className="w-32" aria-label="Filter by size">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Size</SelectItem>
            <SelectItem value="small">&lt;1MB</SelectItem>
            <SelectItem value="medium">1–5MB</SelectItem>
            <SelectItem value="large">&gt;5MB</SelectItem>
          </SelectContent>
        </Select>

        {/* Attached */}
        <Select value={attached} onValueChange={onAttached}>
          <SelectTrigger className="w-36" aria-label="Filter by attachment status">
            <SelectValue placeholder="Attached" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="attached">Attached</SelectItem>
            <SelectItem value="unattached">Unattached</SelectItem>
          </SelectContent>
        </Select>

        {/* Tags + chips */}
        <div
          className="flex items-center gap-1"
          role="list"
          aria-label="Active tag filters"
        >
          {tags.map((t) => (
            <span
              key={t}
              role="listitem"
              className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full text-xs flex items-center gap-1"
            >
              {t}
              <button
                type="button"
                className="text-xs"
                title={`Remove tag ${t}`}
                aria-label={`Remove tag ${t}`}
                onClick={() => onTagsChange(tags.filter((x) => x !== t))}
              >
                ×
              </button>
            </span>
          ))}
          <Input
            placeholder="Add tag"
            aria-label="Add a tag filter"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag();
              }
            }}
            className="w-28"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={addTag}
            aria-label="Add tag filter"
            title="Add tag"
          >
            Add
          </Button>
        </div>

        {/* View toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleView}
          aria-label={`Switch to ${view === "grid" ? "list" : "grid"} view`}
        >
          {view === "grid" ? "List View" : "Grid View"}
        </Button>
      </div>
    </div>
  );
}
