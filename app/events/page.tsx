"use client";

import { useEffect, useState } from "react";
import {
  events,
  EventCategory,
  EventStatus,
  EventSortOption,
  filterEventsByCategory,
  filterEventsByStatus,
  searchEventsByName,
  sortEvents,
} from "@/data/events";
import EventCard from "@/components/EventCard";
import EmptyState from "@/components/EmptyState";

const CATEGORIES: (EventCategory | "All")[] = [
  "All",
  "Tech",
  "Cultural",
  "Sports",
  "Workshop",
  "Career",
  "Music",
];

const EVENT_STATUSES = ["All", "Open", "Full", "Past", "Closed", "Cancelled"] as const;

const SORT_OPTIONS: { label: string; value: EventSortOption }[] = [
  { label: "Date: Soonest first", value: "date-asc" },
  { label: "Date: Latest first", value: "date-desc" },
  { label: "Popularity: Most booked", value: "popularity-desc" },
  { label: "Popularity: Least booked", value: "popularity-asc" },
];

export default function EventsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<EventCategory | "All">("All");
  const [status, setStatus] = useState<EventStatus>("All");
  const [sortBy, setSortBy] = useState<EventSortOption>("date-asc");
  const [, setClock] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const searchedEvents = searchEventsByName(events, query);
  const categoryEvents = filterEventsByCategory(searchedEvents, category);
  const matchingEvents = filterEventsByStatus(categoryEvents, status);
  const sortedEvents = sortEvents(matchingEvents, sortBy);

  return (
    <section className="shell" style={{ padding: "40px 0 64px" }}>
      <div style={{ marginBottom: 28 }}>
        <span className="eyebrow-tag">the board</span>
        <h1 style={{ fontSize: 30, marginTop: 10 }}>All events</h1>
        <p style={{ marginTop: 8 }}>
          Everything posted by clubs and departments this semester.
        </p>
      </div>

      <div
        style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}
      >
        <input
          type="search"
          placeholder="Search events by name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: "1 1 240px",
            padding: "10px 14px",
            border: "1.5px solid var(--line)",
            borderRadius: "var(--radius)",
            fontSize: 14.5,
            background: "var(--paper-raised)",
          }}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as EventCategory | "All")}
          style={{
            padding: "10px 14px",
            border: "1.5px solid var(--line)",
            borderRadius: "var(--radius)",
            fontSize: 14.5,
            background: "var(--paper-raised)",
          }}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c === "All" ? "All categories" : c}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as EventStatus)}
          style={{
            padding: "10px 14px",
            border: "1.5px solid var(--line)",
            borderRadius: "var(--radius)",
            fontSize: 14.5,
            background: "var(--paper-raised)",
          }}
        >
          {EVENT_STATUSES.map((eventStatus) => (
            <option key={eventStatus} value={eventStatus}>
              {eventStatus === "All" ? "All events" : eventStatus}
            </option>
          ))}
        </select>

        {/* Sort selector for Date & Popularity */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as EventSortOption)}
          style={{
            padding: "10px 14px",
            border: "1.5px solid var(--line)",
            borderRadius: "var(--radius)",
            fontSize: 14.5,
            background: "var(--paper-raised)",
            fontWeight: 500,
          }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 16,
        }}
      >
        {sortedEvents.length > 0 ? (
          sortedEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))
        ) : (
          <EmptyState
            title="No events found"
            description="Try a different search term, category, or status to see what's on."
          />
        )}
      </div>
    </section>
  );
}

