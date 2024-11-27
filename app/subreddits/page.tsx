"use client";

import { useState } from "react";
import Layout from "./layout";

interface Subreddit {
  subreddit: string;
  engagement: number;
  size: number;
  activity: number;
  relevance: number;
}

const SubredditsPage: React.FC = () => {
  const [keywords, setKeywords] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<Subreddit[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchSubreddits = async () => {
    if (!keywords.trim()) {
      setError("Please enter at least one keyword.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/rank_subreddits/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keywords: keywords.split(",") }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch subreddits. Please try again.");
      }

      const data = await response.json();
      setResults(data.subreddits || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div>
        <label htmlFor="keywords" style={{ fontWeight: "bold" }}>
          Enter Keywords (comma-separated):
        </label>
        <br />
        <input
          id="keywords"
          type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="e.g., technology, programming"
          style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
        />
      </div>
      <button
        onClick={fetchSubreddits}
        disabled={loading}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        {loading ? "Fetching..." : "Find Subreddits"}
      </button>

      {error && (
        <div style={{ color: "red", marginTop: "1rem" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {results.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Top Subreddits</h2>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "1rem",
            }}
          >
            <thead>
              <tr>
                <th style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
                  Subreddit
                </th>
                <th style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
                  Engagement
                </th>
                <th style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
                  Subscribers
                </th>
                <th style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
                  Activity
                </th>
                <th style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
                  Relevance
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((subreddit, idx) => (
                <tr key={idx}>
                  <td style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
                    {subreddit.subreddit}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
                    {subreddit.engagement.toFixed(2)}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
                    {subreddit.size.toLocaleString()}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
                    {subreddit.activity.toFixed(2)}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
                    {subreddit.relevance.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};

export default SubredditsPage;
