"use client";
import { useEffect, useState } from "react";
import { getResources, readableApiError } from "@/lib/api";
import { ResourceArticle } from "@/types";
export function useResources() {
  const [articles, setArticles] = useState<ResourceArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getResources()
      .then((items) => {
        if (active) setArticles(items);
      })
      .catch((cause) => {
        if (active) setError(readableApiError(cause));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  return {
    articles,
    loading,
    error,
    retry: () => setAttempt((value) => value + 1),
  };
}
