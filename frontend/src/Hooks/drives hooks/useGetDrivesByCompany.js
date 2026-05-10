import { useEffect, useState } from "react";
import { getAllDrivesByCompany } from "../../api/driveApi";

export function useGetDrivesByCompany(id) {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    async function fetchDrives() {
      try {
        setLoading(true);

        const data = await getAllDrivesByCompany(id);

        setDrives(data.drives || data.data || []);
      } catch (err) {
        console.log("Fetch company drives error:", err);
        setError(err.message);
        setDrives([]);
      } finally {
        setLoading(false);
      }
    }

    fetchDrives();
  }, [id]);

  return { drives, loading, error };
}
