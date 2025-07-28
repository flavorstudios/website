"use client";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Point {
  label: string;
  total: number;
  spamPercent: number;
}

export default function CommentStatsChart() {
  const [daily, setDaily] = useState<Point[]>([]);
  const [weekly, setWeekly] = useState<Point[]>([]);
  const [view, setView] = useState<"daily" | "weekly">("daily");
  const [loading, setLoading] = useState(true);

  interface ApiPoint {
    date?: string;
    week?: string;
    count: number;
    spam: number;
  }

  useEffect(() => {
    fetch("/api/admin/comments/stats")
      .then((res) => res.json())
      .then((data) => {
        const d = (data.daily as ApiPoint[] | undefined || []).map((p) => ({
          label: p.date ? p.date.slice(5) : "",
          total: p.count,
          spamPercent: p.count ? Math.round((p.spam / p.count) * 100) : 0,
        }));
        const w = (data.weekly as ApiPoint[] | undefined || []).map((p) => ({
          label: p.week || "",
          total: p.count,
          spamPercent: p.count ? Math.round((p.spam / p.count) * 100) : 0,
        }));
        setDaily(d);
        setWeekly(w);
      })
      .catch((err) => console.error("Failed to load comment stats", err))
      .finally(() => setLoading(false));
  }, []);

  const data = view === "daily" ? daily : weekly;
  if (loading) return <p>Loading statistics...</p>;
  if (data.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Comment Stats</h3>
          <div className="space-x-2">
            <Button
              size="sm"
              variant={view === "daily" ? "default" : "outline"}
              onClick={() => setView("daily")}
            >
              Daily
            </Button>
            <Button
              size="sm"
              variant={view === "weekly" ? "default" : "outline"}
              onClick={() => setView("weekly")}
            >
              Weekly
            </Button>
          </div>
        </div>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis yAxisId="left" />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="total"
                name="Comments"
                stroke="#8884d8"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="spamPercent"
                name="Spam %"
                stroke="#ff7300"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
