import axios from "axios";

export const API = axios.create({
  baseURL: "https://vinyl-backend.onrender.com", // backend URL
});

// functie om token toe te voegen aan headers
export function setAuthToken(token) {
  if (token) {
    API.defaults.headers.common["Authorization"] = token; // ← hier moet precies de token komen
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
}
