import React, { useEffect, useState } from "react";
import type { MemoryItem } from "@dementia/contracts";
import { api } from "../api";
import { speakText } from "../utils/speech";

interface MemorySupportProps {
  patientId: string;
  token: string;
  voiceEnabled: boolean;
}

export const MemorySupport: React.FC<MemorySupportProps> = ({
  patientId,
  token,
  voiceEnabled
}) => {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeMemory, setActiveMemory] = useState<MemoryItem | null>(null);

  useEffect(() => {
    let active = true;
    api.getMemories(patientId, token)
      .then((data) => {
        if (active) {
          setMemories(data);
          if (data.length > 0) setActiveMemory(data[0]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [patientId, token]);

  const handleReadMemory = (item: MemoryItem) => {
    speakText(`${item.title}. Relationship: ${item.relationshipTag || "Family"}. ${item.cue}`, voiceEnabled);
  };

  return (
    <section className="memory-support-flow">
      <div className="section-header">
        <h1>Family & Memory Album</h1>
        <p>Warm memories and familiar faces who love you.</p>
      </div>

      {loading && <p className="loading-state">Loading your favorite memories…</p>}

      {!loading && memories.length === 0 && (
        <div className="card-soft">
          <p>Your caregiver will add memory cards for you soon.</p>
        </div>
      )}

      {!loading && memories.length > 0 && (
        <>
          {/* Active Featured Memory Card */}
          {activeMemory && (
            <article className="featured-memory-card">
              <div className="memory-avatar-large" aria-hidden="true">
                {activeMemory.imageEmoji || "📸"}
              </div>
              <div className="memory-tag">{activeMemory.relationshipTag || "Family"}</div>
              <h2 className="memory-title">{activeMemory.title}</h2>
              <p className="memory-cue">{activeMemory.cue}</p>

              <button
                type="button"
                className="btn-listen-memory"
                onClick={() => handleReadMemory(activeMemory)}
              >
                🔊 Hear Story
              </button>
            </article>
          )}

          {/* Quick Select Carousel / List */}
          <div className="memory-grid">
            {memories.map((item) => {
              const isSelected = activeMemory?.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`memory-thumb-card ${isSelected ? "selected" : ""}`}
                  onClick={() => {
                    setActiveMemory(item);
                    handleReadMemory(item);
                  }}
                >
                  <span className="thumb-emoji">{item.imageEmoji || "📸"}</span>
                  <div className="thumb-info">
                    <span className="thumb-title">{item.title}</span>
                    <span className="thumb-tag">{item.relationshipTag}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
};
