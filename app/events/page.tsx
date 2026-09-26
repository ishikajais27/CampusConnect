"use client";

import { useEffect, useState } from "react";
import {
  events,
  EventCategory,
  EventStatus,
  filterEventsByCategory,
  filterEventsByStatus,
  searchEventsByName,
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

//this is for the new filtering option of event status
const EVENT_STATUSES = ["All", "Open", "Full", "Past", "Closed", "Cancelled"] as const;

export default function EventsPage() {
  // DONE

  // PARTICIPANT TASK (Task 1): these two pieces of state exist so the
  // search box and category dropdown below are usable, but right now
  // nothing actually reads them — the grid below always renders every
  // event in `events`. Wire this up to `searchEventsByName` and
  // `filterEventsByCategory` from data/events.ts, and make the two
  // compose together.

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<EventCategory | "All">("All");
  // for the new filter
  const [status, setStatus] = useState<EventStatus>("All");
  const [, setClock] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  // to store the events after searching
  const searchedEvents = searchEventsByName(events, query);
  // same to store events after category filtering
  const categoryEvents = filterEventsByCategory(searchedEvents, category);
  // this is for storing events after doing both filters better would be a single direct pass but its too late for me now

  const matchingEvents = filterEventsByStatus(categoryEvents, status);

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

        {/* the new cateogry section */}
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
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 16,
        }}
      >
        {/* again its too late to optimize this */}
        {matchingEvents.length > 0 ? (
          matchingEvents.map((event) => (
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
