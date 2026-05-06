import { useEffect, useState } from "react";
import { getCompanies } from "../../api/companyApi.js";

export function useGetCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const data = await getCompanies();

        setCompanies(data.companies || []);
      } catch (err) {
        console.log("Fetch companies error:", err);
        setError(err.message);
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCompanies();
  }, []);

  return { companies, loading, error };
}
