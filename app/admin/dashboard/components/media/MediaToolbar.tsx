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

interface Props {
  search: string;
  onSearchChange: (val: string) => void;
  typeFilter: string;
  onTypeFilter: (val: string) => void;
  sortBy: string;
  onSortBy: (val: string) => void;
  view: "grid" | "list";
  onToggleView: () => void;
  favoritesOnly: boolean;
  onFavoritesToggle: () => void;
}

export default function MediaToolbar({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilter,
  sortBy,
  onSortBy,
  view,
  onToggleView,
  favoritesOnly,
  onFavoritesToggle,
}: Props) {
  return (
    <div className="space-y-4 mb-4">
      <AdminPageHeader
        title="Media Library"
        subtitle="Manage and organize your uploaded media files"
      />
      <div className="flex items-center flex-wrap gap-2">
        <Input
          placeholder="Search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-48"
        />

        <Select value={typeFilter} onValueChange={onTypeFilter}>
          <SelectTrigger className="w-36" aria-label="Type">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={onSortBy}>
          <SelectTrigger className="w-36" aria-label="Sort">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={favoritesOnly ? "default" : "outline"}
          size="sm"
          onClick={onFavoritesToggle}
          aria-pressed={favoritesOnly}
          className="flex items-center gap-1"
        >
          <Star className={favoritesOnly ? "w-4 h-4 fill-current" : "w-4 h-4"} />
          Favorites
        </Button>

        <Button variant="outline" size="sm" onClick={onToggleView}>
          {view === "grid" ? "List View" : "Grid View"}
        </Button>
      </div>
    </div>
  );
}
