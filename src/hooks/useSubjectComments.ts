import { useState, useEffect } from "react";

export function useSubjectComments(subjectId: string) {
  const [comments, setComments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchComments() {
      try {
        // Exemple : appel API, à adapter
        const response = await fetch(`/api/comments?subjectId=${subjectId}`);
        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error("Failed to load comments", error);
      } finally {
        setLoading(false);
      }
    }

    if (subjectId) {
      fetchComments();
    }
  }, [subjectId]);

  return { comments, loading };
}

