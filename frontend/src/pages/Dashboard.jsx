import React, { useEffect, useState, useRef } from "react";
import PageWrapper from "../components/PageWrapper";

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const cardRef = useRef(null);

  const API = import.meta.env.VITE_API_ENDPOINT || "";
  const eventsUrl = API.endsWith("/") ? `${API}v1/events` : `${API}/v1/events`;

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setLoading(true);
    try {
      const res = await fetch(eventsUrl);
      const data = await res.json();
      setEvents(data.items || []);
    } catch (err) {
      setEvents([]);
    }
    setLoading(false);
  }

  function scrollToCards() {
    cardRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <PageWrapper>
      <section className="hero">
        <h1 className="hero-title">Smart Resource Tracker</h1>
        <p className="hero-sub">Real-time analytics, alerts & monitoring.</p>
        <button onClick={scrollToCards} className="btn-primary">Get Started</button>
      </section>

      <section ref={cardRef} className="dashboard-grid">
        <div className="card">
          <h3>Resource Usage</h3>
          <div className="chart-placeholder">Chart Coming Next…</div>
        </div>

        <div className="card">
          <h3>Recent Events</h3>
          {loading ? (
            <div>Loading...</div>
          ) : events.length === 0 ? (
            <div>No events yet.</div>
          ) : (
            <ul className="events-list">
              {events.map((e, i) => (
                <li key={i}>
                  <span>{e.device_id}</span>
                  <span>{e.value}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </PageWrapper>
  );
}
