"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import AdminPageHeader from "@/components/AdminPageHeader";
import { fetcher } from "@/lib/fetcher";
import { useToast } from "@/hooks/use-toast";
import { Download, Star, Mail, Heart } from "lucide-react";

interface Submission {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  skills?: string;
  portfolio?: string;
  message?: string;
  resumeUrl?: string;
  status?: string;
  tags?: string[];
  notes?: string;
  interviewAt?: string;
  reviewed?: boolean;
  createdAt?: string;
  rating?: number;
  favorite?: boolean;
}

const STATUS_OPTIONS = [
  { value: "new", label: "New", class: "bg-yellow-100 text-yellow-700" },
  { value: "reviewed", label: "Reviewed", class: "bg-blue-100 text-blue-700" },
  { value: "interview", label: "Interview", class: "bg-purple-100 text-purple-700" },
  { value: "hired", label: "Hired", class: "bg-green-100 text-green-700" },
  { value: "rejected", label: "Rejected", class: "bg-red-100 text-red-700" },
];

const getStatusInfo = (value?: string, reviewed?: boolean) => {
  const status = value || (reviewed ? "reviewed" : "new");
  return STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];
};

export default function Applications() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selected, setSelected] = useState<Submission | null>(null);
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const { toast } = useToast();

  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<{ submissions: Submission[] }>("/api/admin/career-submissions", fetcher, {
    refreshInterval: 30000,
  });

  const submissions = data?.submissions || [];
  const prevCount = useRef(0);

  useEffect(() => {
    if (submissions.length > prevCount.current && prevCount.current !== 0) {
      toast.success("New applications received");
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("New job application received");
        } else if (Notification.permission === "default") {
          Notification.requestPermission();
        }
      }
    }
    prevCount.current = submissions.length;
  }, [submissions.length, toast]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setTagFilter("");
    setRatingFilter("all");
    setStartDate("");
    setEndDate("");
    setSortBy("newest");
    setFavoriteOnly(false);
  };

  const statusCounts = STATUS_OPTIONS.map((opt) => ({
    ...opt,
    count: submissions.filter(
      (s) => getStatusInfo(s.status, s.reviewed).value === opt.value
    ).length,
  }));
  const favoriteCount = submissions.filter((s) => s.favorite).length;

  const updateSubmission = async (
    id: string,
    updates: Partial<Submission>
  ) => {
    await fetch(`/api/admin/career-submissions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(updates),
    });
    mutate();
  };

  const markReviewed = async (id: string) => {
    await updateSubmission(id, { status: "reviewed", reviewed: true });
    toast.success("Application marked as reviewed");
  };

  const filtered = submissions.filter((s) => {
    const matchSearch =
      s.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      s.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase());
    const status = getStatusInfo(s.status, s.reviewed).value;
    const matchStatus = statusFilter === "all" || status === statusFilter;
    const tags = tagFilter
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    const matchTags =
      tags.length === 0 ||
      tags.some((t) =>
        s.tags?.map((tag) => tag.toLowerCase()).includes(t)
      );
    const matchRating =
      ratingFilter === "all" || (s.rating || 0) >= Number(ratingFilter);
    const created = s.createdAt ? new Date(s.createdAt) : null;
    const matchStart = !startDate || (created && created >= new Date(startDate));
    const matchEnd = !endDate || (created && created <= new Date(endDate));
    const matchFavorite = !favoriteOnly || s.favorite;
    return (
      matchSearch &&
      matchStatus &&
      matchTags &&
      matchRating &&
      matchStart &&
      matchEnd &&
      matchFavorite
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return (
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime()
        );
      case "name":
        return (
          `${a.firstName || ""} ${a.lastName || ""}`.localeCompare(
            `${b.firstName || ""} ${b.lastName || ""}`
          )
        );
      case "status":
        return getStatusInfo(a.status, a.reviewed).value.localeCompare(
          getStatusInfo(b.status, b.reviewed).value
        );
      case "rating":
        return (b.rating || 0) - (a.rating || 0);  
      default:
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
    }
  });

  const handleExport = () => {
    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Skills",
      "Tags",
      "Status",
      "Interview",
      "Submitted",
      "Rating",
      "Favorite",
    ];
    const rows = sorted.map((s) => [
      s.firstName || "",
      s.lastName || "",
      s.email || "",
      s.skills || "",
      (s.tags || []).join(";"),
      getStatusInfo(s.status, s.reviewed).label,
      s.interviewAt ? format(new Date(s.interviewAt), "yyyy-MM-dd HH:mm") : "",
      s.createdAt ? format(new Date(s.createdAt), "yyyy-MM-dd HH:mm") : "",
      s.rating || "",
      s.favorite ? "Yes" : "No",
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((field) => `"${String(field).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "applications.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-red-600 mb-4">Failed to load applications.</p>
        <Button onClick={() => mutate()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* --- Standardized Admin Section Header --- */}
      <AdminPageHeader
        title="Applications"
        subtitle="Manage all user submissions and job applications"
      />
      <div className="flex flex-wrap gap-2">
        <Button
          key="all"
          variant={statusFilter === "all" ? "default" : "outline"}
          className="h-8"
          onClick={() => setStatusFilter("all")}
        >
          All
          <Badge variant="secondary" className="ml-2">
            {submissions.length}
          </Badge>
        </Button>
        <Button
          key="favorites"
          variant={favoriteOnly ? "default" : "outline"}
          className="h-8"
          onClick={() => setFavoriteOnly((v) => !v)}
        >
          Favorites
          <Badge variant="secondary" className="ml-2">
            {favoriteCount}
          </Badge>
        </Button>
        {statusCounts.map((opt) => (
          <Button
            key={opt.value}
            variant={statusFilter === opt.value ? "default" : "outline"}
            className="h-8"
            onClick={() => setStatusFilter(opt.value)}
          >
            {opt.label}
            <Badge variant="secondary" className="ml-2">
              {opt.count}
            </Badge>
          </Button>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex flex-wrap items-center gap-2 w-full">
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-48"
          />
          <Input
            placeholder="Tags"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="w-full sm:w-40"
          />
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ratings</SelectItem>
              <SelectItem value="1">1+ stars</SelectItem>
              <SelectItem value="2">2+ stars</SelectItem>
              <SelectItem value="3">3+ stars</SelectItem>
              <SelectItem value="4">4+ stars</SelectItem>
              <SelectItem value="5">5 stars</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full sm:w-40"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full sm:w-40"
          />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <Button
            onClick={clearFilters}
            variant="ghost"
            size="sm"
            className="w-full sm:w-auto"
          >
            Clear Filters
          </Button>
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>
      <p className="text-sm text-gray-500">Showing {sorted.length} of {submissions.length} applications</p>

      {/* Desktop table */}
      <div className="hidden sm:block">
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Skills</th>
                  <th className="p-3 text-left">Tags</th>
                  <th className="p-3 text-left">Submitted</th>
                  <th className="p-3 text-left">Interview</th>
                  <th className="p-3 text-left">Rating</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {sorted.map((s) => {
                  const info = getStatusInfo(s.status, s.reviewed);
                  return (
                    <tr key={s.id} className="border-b last:border-b-0">
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {s.favorite && (
                            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                          )}
                          {s.firstName} {s.lastName}
                        </div>
                      </td>
                      <td className="p-3 whitespace-nowrap">{s.email}</td>
                      <td className="p-3 whitespace-nowrap">{s.skills}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {s.tags?.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {s.createdAt ? format(new Date(s.createdAt), "P") : ""}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {s.interviewAt ? format(new Date(s.interviewAt), "Pp") : "-"}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <button
                              key={i}
                              onClick={() =>
                                updateSubmission(s.id, {
                                  rating: s.rating === i + 1 ? 0 : i + 1,
                                })
                              }
                              className="text-left"
                              aria-label={`Rate ${i + 1} star${i === 0 ? "" : "s"}`}
                            >
                              <Star
                                className={`h-4 w-4 ${
                                  i < (s.rating || 0)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <Badge className={info.class}>{info.label}</Badge>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateSubmission(s.id, { favorite: !s.favorite })
                          }
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              s.favorite
                                ? "fill-red-500 text-red-500"
                                : "text-gray-300"
                            }`}
                          />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setSelected(s)}>
                          View
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <a href={`mailto:${s.email}`}>Email</a>
                        </Button>
                        {info.value === "new" && (
                          <Button size="sm" onClick={() => markReviewed(s.id)}>
                            Mark Reviewed
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {sorted.length === 0 && (
                  <tr>
                    <td className="p-6 text-center text-gray-500" colSpan={9}>
                      No submissions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Mobile cards */}
      <div className="space-y-4 sm:hidden">
        {sorted.map((s) => {
          const info = getStatusInfo(s.status, s.reviewed);
          return (
            <Card key={s.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium flex items-center gap-1">
                      {s.favorite && (
                        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                      )}
                      {s.firstName} {s.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{s.email}</p>
                  </div>
                  <Badge className={info.class}>{info.label}</Badge>
                </div>
                {s.skills && <p className="text-sm">{s.skills}</p>}
                {s.tags && (
                  <div className="flex flex-wrap gap-1">
                    {s.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                {s.interviewAt && (
                  <p className="text-sm text-gray-600">
                    Interview: {format(new Date(s.interviewAt), "Pp")}
                  </p>
                )}
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        updateSubmission(s.id, {
                          rating: s.rating === i + 1 ? 0 : i + 1,
                        })
                      }
                      aria-label={`Rate ${i + 1} star${i === 0 ? "" : "s"}`}
                    >
                      <Star
                        className={`h-4 w-4 ${
                          i < (s.rating || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateSubmission(s.id, { favorite: !s.favorite })}
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        s.favorite ? "fill-red-500 text-red-500" : "text-gray-300"
                      }`}
                    />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setSelected(s)}>
                    View
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <a href={`mailto:${s.email}`}>Email</a>
                  </Button>
                  {info.value === "new" && (
                    <Button size="sm" onClick={() => markReviewed(s.id)}>
                      Mark Reviewed
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {sorted.length === 0 && (
          <p className="text-center text-gray-500">No submissions found</p>
        )}
      </div>

      {selected && (
        <ApplicationDialog
          submission={selected}
          onOpenChange={(open) => {
            if (!open) setSelected(null);
          }}
          onSave={async (updates) => {
            await updateSubmission(selected.id, updates);
            toast.success("Application updated");
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}

interface ApplicationDialogProps {
  submission: Submission;
  onOpenChange: (open: boolean) => void;
  onSave: (updates: Partial<Submission>) => Promise<void>;
}

function ApplicationDialog({ submission, onOpenChange, onSave }: ApplicationDialogProps) {
  const [status, setStatus] = useState(
    getStatusInfo(submission.status, submission.reviewed).value
  );
  const [notes, setNotes] = useState(submission.notes || "");
  const [tags, setTags] = useState(submission.tags?.join(", ") || "");
  const [interviewAt, setInterviewAt] = useState(submission.interviewAt || "");
  const [rating, setRating] = useState(String(submission.rating || 0));
  const [favorite, setFavorite] = useState(submission.favorite || false);

  const handleSave = async () => {
    const updates: Partial<Submission> = {
      status,
      reviewed: status !== "new",
      notes,
      interviewAt,
      rating: Number(rating) || undefined,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      favorite,
    };
    await onSave(updates);
  };

  const downloadICS = () => {
    if (!interviewAt) return;
    const start = new Date(interviewAt);
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `DTSTART:${format(start, "yyyyMMdd'T'HHmmss'Z'")}`,
      `DTEND:${format(end, "yyyyMMdd'T'HHmmss'Z'")}`,
      `SUMMARY:Interview with ${submission.firstName || ""} ${
        submission.lastName || ""
      }`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\n");
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "interview.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl space-y-4">
        <h3 className="text-lg font-medium">Application Details</h3>
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Name:</span> {submission.firstName}{" "}
            {submission.lastName}
          </p>
          <p>
            <span className="font-medium">Email:</span>{" "}
            <a
              href={`mailto:${submission.email}`}
              className="text-blue-600 underline"
            >
              {submission.email}
            </a>
            <Button size="sm" variant="outline" className="ml-2" asChild>
              <a href={`mailto:${submission.email}`} className="flex items-center">
                <Mail className="mr-1 h-4 w-4" /> Email
              </a>
            </Button>
          </p>
          {submission.skills && (
            <p>
              <span className="font-medium">Skills:</span> {submission.skills}
            </p>
          )}
          {submission.portfolio && (
            <p>
              <span className="font-medium">Portfolio:</span>{" "}
              <a
                href={submission.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View
              </a>
            </p>
          )}
          {submission.resumeUrl && (
            <div className="space-y-2">
              <iframe
                src={submission.resumeUrl}
                title="Resume preview"
                className="w-full h-48 rounded border"
              />
              <div className="text-right">
                <a
                  href={submission.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 underline"
                >
                  Download Resume
                </a>
              </div>
            </div>
          )}
          {submission.message && (
            <p className="whitespace-pre-wrap">
              <span className="font-medium">Message:</span> {submission.message}
            </p>
          )}
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Tags</label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tag1, tag2"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Rating</label>
            <Select value={rating} onValueChange={setRating}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">None</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="favorite"
              checked={favorite}
              onCheckedChange={(v) => setFavorite(Boolean(v))}
            />
            <label htmlFor="favorite" className="text-sm font-medium leading-none">
              Favorite
            </label>
          </div>
          <div>
            <label className="text-sm font-medium">Interview</label>
            <Input
              type="datetime-local"
              value={interviewAt ? interviewAt.slice(0, 16) : ""}
              onChange={(e) => setInterviewAt(e.target.value)}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-2"
              disabled={!interviewAt}
              onClick={downloadICS}
            >
              Add to Calendar
            </Button>
          </div>
          <div>
            <label className="text-sm font-medium">Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}