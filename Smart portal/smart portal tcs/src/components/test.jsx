import React, { useState, useEffect, useRef } from "react";
// 1. Point directly to the specific source URL
const SOURCE_URL = "http://localhost:8080/events/jobs";
const TARGET_SOURCE = "jobs"; // Just for labeling your state
function Test() {
  const [data, setData] = useState({});
  const [status, setStatus] = useState("disconnected");
  const reconnectTimer = useRef(null);
  const applyDelta = (source, delta) => {
    setData((prev) => {
      const updated = { ...prev };
      const sourceData = { ...(updated[source] || {}) };
      if (delta.type === "new") {
        sourceData[delta.key] = delta.metrics;
      }
      if (delta.type === "update") {
        if (Array.isArray(sourceData[delta.key])) {
          const arr = [...sourceData[delta.key]];
          delta.changes.forEach((change) => {
            arr[change.index] = change.new;
          });
          sourceData[delta.key] = arr;
        } else {
          sourceData[delta.key] = delta.changes[0].new;
        }
      }
      updated[source] = sourceData;
      return updated;
    });
  };
  const connectToStream = (retry = 0) => {
    setStatus("connecting");
    // 2. Connect ONLY to the jobs URL
    const es = new EventSource(SOURCE_URL);
    console.log(es)
    es.onopen = () => {
      setStatus("connected");
    };
    es.onerror = () => {
      es.close();
      setStatus("disconnected");
      const timeout = Math.min(5000, 1000 * (retry + 1));
      reconnectTimer.current = setTimeout(() => {
        connectToStream(retry + 1);
      }, timeout);
    };
    es.onmessage = (e) => {
      try {
        const { type, payload } = JSON.parse(e.data);
        if (type === "snapshot") {
          setData((prev) => ({
            ...prev,
            [TARGET_SOURCE]: payload,
          }));
        } else if (type === "delta") {
          applyDelta(TARGET_SOURCE, payload);
        }
      } catch (err) {
        console.error(`Error parsing message from ${SOURCE_URL}:`, err);
      }
    };
    return es;
  };
  useEffect(() => {
    const es = connectToStream();
    return () => {
      es.close();
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
    };
  }, []);
  console.log(data || {})
  return (
    <div>
      <h1>Listening to: {TARGET_SOURCE}</h1>
      <p>URL: {SOURCE_URL}</p>
      <p>Status: {status}</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
export default Test;
