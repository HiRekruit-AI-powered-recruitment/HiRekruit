import axios from "axios";

const URL = import.meta.env.VITE_BASE_URL;

export async function getAllUser() {
  try {
    const response = await axios.get(`${URL}/api/auth/users`, {
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    console.log("Get all users:", error);
    throw new Error(error.response?.data?.message || error.message);
  }
}
