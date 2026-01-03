import { useState, useEffect } from "react";
import { API } from "../services/api";
import styles from "./Dashboard.module.css";
import { searchSpotifyAlbum } from "../services/spotify";

export default function Dashboard() {
  const [vinyls, setVinyls] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [year, setYear] = useState("");
  const [image, setImage] = useState("");
  const [url, setUrl] = useState(""); 

  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [openedTracklistId, setOpenedTracklistId] = useState(null);
  const [tracklistMap, setTracklistMap] = useState({});

  const [releaseId, setReleaseId] = useState("");
  const [discogsData, setDiscogsData] = useState(null);

  // 🔹 Toggle switch state
  const [isToggled, setIsToggled] = useState(() => {
    return localStorage.getItem("toggleState") === "true";
  });

  useEffect(() => {
    localStorage.setItem("toggleState", isToggled);
  }, [isToggled]);

  useEffect(() => {
    if (isToggled) {
      document.body.style.backgroundColor = "#121212";
      
      
    } else {
      document.body.style.backgroundColor = "#FFF";
    }
  }, [isToggled]);

  useEffect(() => {
    const fetchVinyls = async () => {
      try {
        const res = await API.get("/vinyls");
        setVinyls(res.data);
      } catch (err) {
        console.error("Error bij fetchVinyls:", err.response?.data || err.message);
      }
    };
    fetchVinyls();
  }, []);

  const handleAddVinyl = async (e) => {
    e.preventDefault();
    try {
      let res;

      if (editId) {
        res = await API.put(`/vinyls/${editId}`, { 
          title, 
          artist, 
          year, 
          image,
          url,
          releaseId
        });
        setVinyls(vinyls.map(v => v._id === editId ? res.data : v));
      } else {
        res = await API.post("/vinyls", { 
          title, 
          artist, 
          year, 
          image,
          url,
          releaseId
        });
        setVinyls(prev => [...prev, res.data]);
      }

      setTitle(""); 
      setArtist(""); 
      setYear(""); 
      setImage(""); 
      setUrl("");
      setReleaseId("");
      setEditId(null);
      setShowForm(false);

    } catch (err) {
      console.error("Fout bij opslaan:", err.response?.data || err.message);
      alert("Fout bij opslaan van vinyl");
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/vinyls/${id}`);
      setVinyls(prev => prev.filter(v => v._id !== id));
    } catch (err) {
      console.error("Fout bij verwijderen:", err.response?.data || err.message);
      alert("Fout bij verwijderen");
    }
  };

  const handleEdit = (v) => {
    setEditId(v._id);
    setTitle(v.title);
    setArtist(v.artist);
    setYear(v.year);
    setImage(v.image);
    setUrl(v.url);
    setReleaseId(v.releaseId || "");
    setShowForm(true);
  };

  const searchDiscogs = async () => {
    if (!title || !artist) {
      alert("Vul zowel titel als artiest in om te zoeken.");
      return;
    }

    try {
      const res = await API.get("/discogs/search", {
        params: { title, artist },
      });

      setDiscogsData(res.data);

      if (res.data.image) setImage(res.data.image);
      if (res.data.year) setYear(res.data.year);
      if (res.data.releaseId) setReleaseId(res.data.releaseId);

      if (res.data.uri) {
        setUrl(
          res.data.uri.startsWith("http")
            ? res.data.uri
            : `https://www.discogs.com${res.data.uri}`
        );
      }
    } catch (err) {
      console.error("Discogs search error:", err.response?.data || err.message);
      alert("Fout bij zoeken in Discogs");
    }
  };

  const fetchTracklistForVinyl = async (vinyl) => {
    let releaseId = vinyl.releaseId || null;
    if (!releaseId && vinyl.resource_url) {
      const match = vinyl.resource_url.match(/releases\/(\d+)/);
      if (match) releaseId = match[1];
    }
    if (!releaseId) {
      alert("Geen Discogs releaseId beschikbaar voor dit album.");
      return;
    }

    if (tracklistMap[vinyl._id]) {
      setOpenedTracklistId(openedTracklistId === vinyl._id ? null : vinyl._id);
      return;
    }

    try {
      const res = await API.get("/discogs/tracklist", { params: { releaseId } });
      const tracks = res.data.tracklist || [];
      setTracklistMap(prev => ({ ...prev, [vinyl._id]: tracks }));
      setOpenedTracklistId(vinyl._id);
    } catch (err) {
      console.error("Kon tracklist niet ophalen:", err.response?.data || err.message);
      alert("Kon tracklist niet ophalen");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🎶 My Vinyl Collection 🎶</h1>

      {/* 🔹 Toggle switch */}
      <div className={styles.wrapper}>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            className={styles.toggle_input}
            checked={isToggled}
            onChange={() => setIsToggled(!isToggled ? styles.night : "")}
          />
          <div className={styles.toggle_bg}></div>
          <div className={styles.toggle_switch}>
            <div className={styles.toggle_switch_figure}></div>
            <div className={styles.toggle_switch_figureAlt}></div>
          </div>
        </label>
      </div>

      {/* 🔹 Add Vinyl button */}
      <button
        className={styles.button_add}
        onClick={() => { setShowForm(!showForm); setEditId(null); }}
      >
        {showForm ? "Cancel" : "Add Vinyl"}
      </button>

      {showForm && (
        <form onSubmit={handleAddVinyl} className={styles.form}>
          <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input placeholder="Artist" value={artist} onChange={(e) => setArtist(e.target.value)} />
          <button type="button" className={styles.button_search_in_discogs} onClick={searchDiscogs}>
            Search in Discogs
          </button>
          <input disabled placeholder="Year" type="number" value={year} onChange={(e) => setYear(e.target.value)} />
          <input disabled placeholder="Photo URL" value={image} onChange={(e) => setImage(e.target.value)} />
          <button type="submit" className={styles.button}>{editId ? "Save" : "Add"}</button>
        </form>
      )}

      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.searchInput}
      />

      <ul className={styles.vinylList}>
        {vinyls
          .filter((v) =>
            v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.artist.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((v) => (
            <li key={v._id} className={styles.vinylItem}>
              {v.image && v.url ? (
                <a href={v.url} target="_blank" rel="noopener noreferrer">
                  <img src={v.image} alt={v.title} className={styles.vinylImage} />
                </a>
              ) : v.image && <img src={v.image} alt={v.title} className={styles.vinylImage} />}
              
              <div className={styles.vinylInfo}>
                <strong>{v.title}</strong>
                <div>{v.artist} ({v.year})</div>
              </div>

              <button
                className={styles.button_spotify}
                onClick={async () => {
                  const spotifyAlbum = await searchSpotifyAlbum(v.artist, v.title);
                  if (spotifyAlbum?.external_urls?.spotify) {
                    window.open(spotifyAlbum.external_urls.spotify, "_blank");
                  } else {
                    alert("Album niet gevonden op Spotify");
                  }
                }}
              >
                Open in Spotify
              </button>
              <button className={styles.button_tracklist} onClick={() => fetchTracklistForVinyl(v)}>
                {openedTracklistId === v._id ? "Close Tracklist" : "Show Tracklist"}
              </button>
              <button className={styles.button} onClick={() => handleEdit(v)}>Edit</button>
              <button className={styles.button_delete} onClick={() => handleDelete(v._id)}>Delete</button>

              {openedTracklistId === v._id && (
                <div className={`${styles.tracklistWrapper} ${styles.open}`}>
                  {tracklistMap[v._id] && (
                    <ul className={styles.tracklistBox}>
                      {tracklistMap[v._id].map((t, i) => (
                        <li key={i}>
                          {t.position ? `${t.position} — ` : ""}
                          {t.title}
                          {t.duration ? ` (${t.duration})` : ""}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

            </li>
          ))}
      </ul>
    </div>
  );
}
