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
import { Star } from "lucide-react";

import type { TypeFilter, SortBy, DateFilter, UsageFilter, SortOrder } from "@/types/media";

interface Props {
  search: string;
  onSearchChange: (val: string) => void;
  typeFilter: TypeFilter;
  onTypeFilter: (val: TypeFilter) => void;
  sortBy: SortBy;
  onSortBy: (val: SortBy) => void;
  sortDir: SortOrder;
  onSortDirToggle: () => void;
  dateFilter: DateFilter;
  onDateFilter: (val: DateFilter) => void;
  view: "grid" | "list";
  onToggleView: () => void;
  usageFilter: UsageFilter;
  onUsageFilter: (val: UsageFilter) => void;
  favoritesOnly: boolean;
  onFavoritesToggle: () => void;
  tagFilter: string;
  onTagFilter: (val: string) => void;
  availableTags: string[];
  /** Reset all search + filters to defaults */
  onResetFilters: () => void;
  /** Whether any filter is active (controls Reset button) */
  canReset: boolean;
}

export default function MediaToolbar({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilter,
  sortBy,
  onSortBy,
  sortDir,
  onSortDirToggle,
  dateFilter,
  onDateFilter,
  view,
  onToggleView,
  favoritesOnly,
  onFavoritesToggle,
  usageFilter,
  onUsageFilter,
  tagFilter,
  onTagFilter,
  availableTags,
  onResetFilters,
  canReset,
}: Props) {
  return (
    <div className="space-y-4 mb-4">
      <AdminPageHeader
        as="h2"
        title="Media Library"
        subtitle="Manage and organize your uploaded media files"
      />
      <div className="flex items-center flex-wrap gap-2">
        <Input
          placeholder="Search"
          aria-label="Search media"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full sm:w-48"
        />

        <Select
          value={typeFilter}
          onValueChange={(val) => onTypeFilter(val as TypeFilter)}
        >
          <SelectTrigger className="w-full sm:w-36" aria-label="Type">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="application">Documents</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(val) => onSortBy(val as SortBy)}>
          <SelectTrigger className="w-full sm:w-36" aria-label="Sort">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="size">Size</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={onSortDirToggle}
          aria-label="Toggle sort direction"
          className="w-full sm:w-auto"
        >
          {sortDir === "asc" ? "Asc" : "Desc"}
        </Button>
        
        <Select
          value={dateFilter}
          onValueChange={(val) => onDateFilter(val as DateFilter)}
        >
          <SelectTrigger className="w-full sm:w-36" aria-label="Date">
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
          </SelectContent>
        </Select>

        {availableTags.length > 0 && (
          <Select value={tagFilter} onValueChange={onTagFilter}>
            <SelectTrigger className="w-full sm:w-36" aria-label="Tag">
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Tags</SelectItem>
              {availableTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={usageFilter} onValueChange={(val) => onUsageFilter(val as UsageFilter)}>
          <SelectTrigger className="w-full sm:w-36" aria-label="Usage">
            <SelectValue placeholder="Usage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Files</SelectItem>
            <SelectItem value="used">Used</SelectItem>
            <SelectItem value="unused">Unused</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={favoritesOnly ? "default" : "outline"}
          size="sm"
          onClick={onFavoritesToggle}
          aria-pressed={favoritesOnly}
          className="flex items-center gap-1 w-full sm:w-auto"
        >
          <Star className={favoritesOnly ? "w-4 h-4 fill-current" : "w-4 h-4"} />
          Favorites
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onToggleView}
          className="w-full sm:w-auto"
        >
          {view === "grid" ? "List View" : "Grid View"}
        </Button>

        {canReset && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="w-full sm:w-auto"
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
