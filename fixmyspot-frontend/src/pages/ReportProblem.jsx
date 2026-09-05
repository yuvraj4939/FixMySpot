import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, ImagePlus, LocateFixed, MapPin, X } from "lucide-react";
import { useReports } from "../context/ReportsContext";

export default function ReportProblem() {
  const { addReport } = useReports();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const cameraRef = useRef(null);

  const [location, setLocation] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [form, setForm] = useState({
    title: "",
    category: "Road",
    severity: "Medium",
    description: ""
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handlePhoto = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Image must be 8 MB or smaller.");
      return;
    }
    setError("");
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const clearPhoto = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPhoto(null);
    setPreview("");
    if (fileRef.current) fileRef.current.value = "";
    if (cameraRef.current) cameraRef.current.value = "";
  };

  const locate = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          address: `Current location (${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)})`
        });
      },
      () => setError("Location permission was denied."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!location) {
      setError("Capture your current location first.");
      return;
    }
    if (!photo) {
      setError("Please upload or capture a photo of the problem.");
      return;
    }

    setBusy(true);
    try {
      await addReport({
        title: form.title,
        category: form.category,
        severity: form.severity,
        description: form.description,
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        image: photo
      });
      navigate("/my-reports");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <section className="page-heading">
        <div>
          <span className="eyebrow">NEW REPORT</span>
          <h1>Report a public problem</h1>
          <p>Add a photo and exact location so the community can verify it.</p>
        </div>
      </section>

      <form className="report-form" onSubmit={submit}>
        <div className="form-panel">
          <h2>1. What is the problem?</h2>

          {error && <div className="error-box">{error}</div>}

          <label>
            Problem title
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Large pothole near school gate"
              required
            />
          </label>

          <div className="two-col">
            <label>
              Category
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option>Road</option>
                <option>Electricity</option>
                <option>Water</option>
                <option>Cleanliness</option>
                <option>Safety</option>
                <option>Public Property</option>
              </select>
            </label>

            <label>
              Severity
              <select
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value })}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </label>
          </div>

          <label>
            Description
            <textarea
              rows="5"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the problem..."
              required
            />
          </label>
        </div>

        <div className="form-panel">
          <h2>2. Add a photo</h2>
          <p className="muted">Take a photo with your camera or choose one from your device.</p>

          <div className="photo-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => cameraRef.current?.click()}
            >
              <Camera size={18} />
              Capture photo
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => fileRef.current?.click()}
            >
              <ImagePlus size={18} />
              Upload photo
            </button>
          </div>

          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden-file-input"
            onChange={(e) => handlePhoto(e.target.files?.[0])}
          />

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden-file-input"
            onChange={(e) => handlePhoto(e.target.files?.[0])}
          />

          {preview ? (
            <div className="photo-preview">
              <img src={preview} alt="Selected problem" />
              <button type="button" className="photo-remove" onClick={clearPhoto} aria-label="Remove photo">
                <X size={17} />
              </button>
              <div className="photo-name">{photo?.name}</div>
            </div>
          ) : (
            <div className="photo-empty">
              <Camera size={30} />
              <strong>No photo selected</strong>
              <span>Use the buttons above to add one.</span>
            </div>
          )}
        </div>

        <div className="form-panel">
          <h2>3. Pin the exact location</h2>

          <button type="button" className="btn btn-secondary" onClick={locate}>
            <LocateFixed size={18} />
            Use my current location
          </button>

          <div className="location-box">
            <MapPin size={20} />
            <div>
              <strong>{location?.address || "Not captured yet"}</strong>
              <span>
                {location
                  ? `${location.latitude}, ${location.longitude}`
                  : "Click the button above."}
              </span>
            </div>
          </div>

          <div className="location-preview">
            <MapPin size={30} />
            <span>Coordinates will be saved with the photo and report in MongoDB.</span>
          </div>
        </div>

        <button className="btn btn-primary btn-large" disabled={busy}>
          {busy ? "Uploading & saving…" : "Submit community report"}
        </button>
      </form>
    </>
  );
}
