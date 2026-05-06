import { useEffect, useState } from "react";
import { getAllDrives } from "../../api/driveApi";

export function useGetAllDrives() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDrives() {
      try {
        const data = await getAllDrives();

        // adjust this depending on backend response shape
        setDrives(data.drives || data.data || []);
      } catch (err) {
        console.log("Fetch drives error:", err);
        setError(err.message);
        setDrives([]);
      } finally {
        setLoading(false);
      }
    }

    fetchDrives();
  }, []);

  return { drives, loading, error };
}
