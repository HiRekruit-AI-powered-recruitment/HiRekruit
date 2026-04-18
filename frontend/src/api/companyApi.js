import axios from "axios";

const URL = import.meta.env.VITE_BASE_URL;

export async function getCompanies() {
  try {
    const response = await axios.get(`${URL}/api/companyinfo/companies`, {
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    console.log("Get companies:", error);
    throw new Error(error.response?.data?.message || error.message);
  }
}
