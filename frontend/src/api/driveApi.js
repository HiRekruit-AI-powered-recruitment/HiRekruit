import axios from "axios";

const URL = import.meta.env.VITE_BASE_URL;

export async function getAllDrives() {
  try {
    const response = await axios.get(`${URL}/api/drive/all`, {
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    console.log("Get all active drives error:", error);
    throw new Error(error.response?.data?.message || error.message);
  }
}

export async function getAllDrivesByCompany(id) {
  try {
    const response = await axios.get(`${URL}/api/drive/company/${id}`, {
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    console.log("Get all drives by company:", error);
    throw new Error(error.response?.data?.message || error.message);
  }
}
