import { useEffect, useState } from "react";
import { getAllCandidates } from "../../api/candidatesApi.js";

export function useGetAllCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCandidates() {
      try {
        const data = await getAllCandidates();

        setCandidates(data.candidates || []);
      } catch (err) {
        console.log("Fetch candidates error:", err);
        setError(err.message);
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCandidates();
  }, []);

  return { candidates, loading, error };
}
