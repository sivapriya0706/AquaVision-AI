import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function CustomerDamageReport() {
  const { user } = useAuth();
  const [damageType, setDamageType] = useState("");
  const [description, setDescription] = useState("");
  const [damagePhoto, setDamagePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [reportStatus, setReportStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myReports, setMyReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);

  const loadMyReports = () => {
    fetch(`http://localhost:5000/api/damage-reports?customerId=${user?.id || "USR-001"}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMyReports(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingReports(false));
  };

  useEffect(() => {
    loadMyReports();
  }, [user?.id]);

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setDamagePhoto(file);
      setReportStatus("");
      const objectUrl = URL.createObjectURL(file);
      setPhotoPreview(objectUrl);
    }
  };

  const handleDamageReport = async (event) => {
    event.preventDefault();

    if (!damageType || !damagePhoto) {
      setReportStatus("Please select damage type and attach a photo.");
      return;
    }

    const formData = new FormData();
    formData.append("damageType", damageType);
    formData.append("damagePhoto", damagePhoto);
    formData.append("customerId", user?.id || "USR-001");
    formData.append("customerName", user?.name || "Sivapriya");
    formData.append("description", description || `Reported ${damageType}`);

    setIsSubmitting(true);
    setReportStatus("Submitting report...");

    try {
      const response = await fetch("http://localhost:5000/api/damage-report", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      setReportStatus(
        `Report ${data.report.reportId} submitted successfully for admin review.`
      );
      setDamageType("");
      setDescription("");
      setDamagePhoto(null);
      setPhotoPreview(null);

      const input = document.getElementById("customer-damage-photo-input");
      if (input) {
        input.value = "";
      }

      loadMyReports();
    } catch (error) {
      setReportStatus(error.message || "Failed to submit damage report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="portal-container">
      <div className="page-header-row">
        <div>
          <h2>Can Damage &amp; Quality Inspection</h2>
          <p>
            Report cracks, leaks, or defects. Attach a photo as evidence for manual verification by the admin QA team.
          </p>
        </div>
      </div>

      <div className="two-col-grid">
        {/* Form Panel */}
        <div className="content-card">
          <div className="card-header">
            <div>
              <span className="card-eyebrow">QUALITY VERIFICATION</span>
              <h3>Submit Damage Report</h3>
            </div>
          </div>

          <form onSubmit={handleDamageReport} className="damage-form">
            <div className="upload-box">
              <div className="upload-icon">📷</div>
              <h3>Attach Water Can Photo</h3>
              <p>
                Take a clear photograph of the defect (crack, valve leak, dent) for verification.
              </p>

              <label className="upload-button" htmlFor="customer-damage-photo-input">
                Choose Photo
                <input
                  id="customer-damage-photo-input"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  hidden
                />
              </label>

              {damagePhoto && (
                <div className="selected-file-info">
                  <span>✓ {damagePhoto.name}</span>
                  {photoPreview && (
                    <div className="photo-preview-wrapper mt-2">
                      <img
                        src={photoPreview}
                        alt="Damage preview"
                        className="preview-img"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="form-group mt-3">
              <label>Damage Type *</label>
              <select
                value={damageType}
                onChange={(e) => setDamageType(e.target.value)}
                required
              >
                <option value="">Select damage type</option>
                <option value="Crack">Crack (Seam or bottom body)</option>
                <option value="Dent">Dent (Impact deformity)</option>
                <option value="Leakage">Leakage (Continuous dripping)</option>
                <option value="Cap Problem">Cap / Dispenser Valve Problem</option>
                <option value="Contamination">Water Color / Odor Concern</option>
                <option value="Other">Other Defect</option>
              </select>
            </div>

            <div className="form-group mt-3">
              <label>Issue Description</label>
              <textarea
                rows={3}
                placeholder="Describe where the defect is located and how it affects water usage..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="verification-disclaimer">
              <span className="disclaimer-icon">ℹ️</span>
              <p>
                <strong>Human Verification Protocol:</strong> Uploaded images are directly inspected by the AquaVision central operations supervisor. Approved damage reports qualify for a free replacement can.
              </p>
            </div>

            <button
              className="btn-primary full-width mt-3"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Uploading Evidence..." : "Submit Damage Report"}
            </button>

            {reportStatus && (
              <p className={`report-status-msg ${reportStatus.includes("successfully") ? "success" : "warning"}`}>
                {reportStatus}
              </p>
            )}
          </form>
        </div>

        {/* History of Submitted Reports */}
        <div className="content-card">
          <div className="card-header">
            <div>
              <span className="card-eyebrow">YOUR SUBMISSIONS</span>
              <h3>Damage Report History</h3>
            </div>
            <button
              type="button"
              className="btn-link"
              onClick={loadMyReports}
            >
              Refresh
            </button>
          </div>

          <div className="report-history-list">
            {loadingReports ? (
              <p className="loading-hint">Loading report history...</p>
            ) : myReports.length === 0 ? (
              <div className="empty-history">
                <span className="empty-icon">✓</span>
                <p>No damage reports submitted. All your cans are in good condition!</p>
              </div>
            ) : (
              myReports.map((report) => (
                <div key={report.reportId} className="history-report-card">
                  <div className="history-report-top">
                    <div>
                      <span className="report-badge-id">{report.reportId}</span>
                      <h4 className="report-type">{report.damageType}</h4>
                    </div>
                    <span
                      className={`status-pill ${
                        report.status === "Approved"
                          ? "success"
                          : report.status === "Rejected"
                          ? "danger"
                          : "warning"
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>

                  <p className="history-report-desc">
                    {report.description || "Defect reported on water can"}
                  </p>

                  <div className="history-report-bottom">
                    <small className="report-date">
                      {new Date(report.createdAt).toLocaleDateString()} •{" "}
                      {new Date(report.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>

                    {report.photo && (
                      <a
                        href={`http://localhost:5000${report.photo}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-outline-sm"
                      >
                        View Photo Evidence
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
