import axios from "axios";

const URL = import.meta.env.VITE_BASE_URL;

export async function getAllCandidates() {
  try {
    const response = await axios.get(`${URL}/api/auth/allCandidates`, {
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    console.log("Get all candidates error:", error);
    throw new Error(error.response?.data?.message || error.message);
  }
}
