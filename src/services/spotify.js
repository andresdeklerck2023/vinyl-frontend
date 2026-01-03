import axios from "axios";
import { API } from "./api"; // jouw bestaande axios instance

export const searchSpotifyAlbum = async (artist, album) => {
  try {
    // 1️⃣ haal token van je backend
    const tokenRes = await API.get("/spotify/token");
    const token = tokenRes.data.access_token;

    // 2️⃣ zoek album op Spotify
    const res = await axios.get("https://api.spotify.com/v1/search", {
      headers: { Authorization: `Bearer ${token}` },
      params: { q: `album:${album} artist:${artist}`, type: "album" }
    });

    return res.data.albums.items[0]; // eerste match
  } catch (err) {
    console.error("Spotify search error:", err.response?.data || err.message);
    return null;
  }
};
