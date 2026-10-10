import { Link, useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { getAuthToken } from "../utils/auth";
import "./ReportProblem.css";

function ReportProblem() {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const token = getAuthToken();

    try {
      const response = await fetch(
        "/api/problem-reports",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({
            deviceType: formData.get("deviceType"),
            brand: formData.get("brand"),
            model: formData.get("model"),
            serialNumber: formData.get("serialNumber"),
            problem: formData.get("problem"),
            description: formData.get("description"),
          }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Unable to submit report (HTTP ${response.status}).`
        );
      }

      navigate("/customer/tickets");
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Cannot reach the TechCare server. Make sure both the frontend and backend are running, then try again."
          : err instanceof Error
          ? err.message
          : "Something went wrong while submitting your report."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);

      setSelectedFiles((previousFiles) => [
        ...previousFiles,
        ...newFiles,
      ]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setSelectedFiles((previousFiles) =>
      previousFiles.filter(
        (_, index) => index !== indexToRemove
      )
    );
  };

  return (
    <div className="report-problem-page">

      {/* HEADER */}
      <header className="report-header">

        <Link
          to="/customer/dashboard"
          className="report-logo"
        >
          <div className="report-logo-icon">
            TC
          </div>

          <div>
            <strong>TechCare</strong>
            <span>Hardware Support</span>
          </div>
        </Link>

        <Link
          to="/customer/dashboard"
          className="back-dashboard"
        >
          ← Back to Dashboard
        </Link>

      </header>


      {/* MAIN */}
      <main className="report-main">

        <div className="report-title">

          <p>TECHCARE SUPPORT</p>

          <h1>Report a Hardware Problem</h1>

          <span>
            Tell us about the problem you're experiencing
            and our support team will help you.
          </span>

        </div>


        {/* FORM CARD */}
        <div className="report-card">

          <form onSubmit={handleSubmit}>

            {/* DEVICE INFORMATION */}
            <div className="form-section">

              <div className="section-heading">

                <div className="section-number">
                  1
                </div>

                <div>
                  <h2>Device Information</h2>

                  <p>
                    Tell us which device is having the problem.
                  </p>
                </div>

              </div>


              <div className="report-grid">

                {/* DEVICE TYPE - REQUIRED */}
                <div className="report-form-group">

                  <label>
                    Device Type <span>*</span>
                  </label>

                  <select
                    name="deviceType"
                    defaultValue=""
                    required
                  >
                    <option
                      value=""
                      disabled
                    >
                      Select device type
                    </option>

                    <option>Laptop</option>
                    <option>Desktop Computer</option>
                    <option>Printer</option>
                    <option>Mobile Phone</option>
                    <option>Tablet</option>
                    <option>Network Equipment</option>
                    <option>Other</option>

                  </select>

                </div>


                {/* BRAND - OPTIONAL */}
                <div className="report-form-group">

                  <label>
                    Brand
                  </label>

                  <input
                    name="brand"
                    type="text"
                    placeholder="e.g. Dell, HP, Lenovo"
                  />

                </div>


                {/* MODEL - OPTIONAL */}
                <div className="report-form-group">

                  <label>
                    Model
                  </label>

                  <input
                    name="model"
                    type="text"
                    placeholder="Enter device model"
                  />

                </div>


                {/* SERIAL NUMBER - REQUIRED */}
                <div className="report-form-group">

                  <label>
                    Serial Number <span>*</span>
                  </label>

                  <input
                    name="serialNumber"
                    type="text"
                    placeholder="Enter serial number"
                    required
                  />

                </div>

              </div>

            </div>


            {/* PROBLEM INFORMATION */}
            <div className="form-section">

              <div className="section-heading">

                <div className="section-number">
                  2
                </div>

                <div>
                  <h2>Problem Information</h2>

                  <p>
                    Describe the problem you're experiencing.
                  </p>
                </div>

              </div>


              {/* PROBLEM - REQUIRED */}
              <div className="report-form-group">

                <label>
                  Problem <span>*</span>
                </label>

                <input
                  name="problem"
                  type="text"
                  placeholder="e.g. Laptop is not charging"
                  required
                />

              </div>


              {/* DESCRIPTION - REQUIRED */}
              <div className="report-form-group">

                <label>
                  Description <span>*</span>
                </label>

                <textarea
                  name="description"
                  rows={6}
                  placeholder="Please describe the problem in detail. Include what happened, when it started, and anything you have already tried."
                  required
                />

              </div>


              {/* ATTACHMENTS */}
              <div className="report-form-group">

                <label>
                  Attach Files
                </label>

                <div className="file-upload-box">

                  <input
                    type="file"
                    id="problem-files"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                  />

                  <label
                    htmlFor="problem-files"
                    className="file-upload-label"
                  >

                    <div className="file-upload-icon">
                      ↑
                    </div>

                    <div>

                      <strong>
                        Click to upload files
                      </strong>

                      <span>
                        or drag and drop your files here
                      </span>

                    </div>

                  </label>

                </div>


                <p className="file-help-text">
                  Attachments are not saved yet. Submit the report details
                  without relying on selected files.
                </p>


                {/* SELECTED FILES */}

                {selectedFiles.length > 0 && (

                  <div className="selected-files">

                    <h4>
                      Selected Files
                    </h4>

                    {selectedFiles.map((file, index) => (

                      <div
                        className="selected-file"
                        key={`${file.name}-${index}`}
                      >

                        <div className="file-info">

                          <div className="file-icon">
                            📎
                          </div>

                          <div>

                            <strong>
                              {file.name}
                            </strong>

                            <span>
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </span>

                          </div>

                        </div>

                        <button
                          type="button"
                          className="remove-file-btn"
                          onClick={() =>
                            removeFile(index)
                          }
                        >
                          Remove
                        </button>

                      </div>

                    ))}

                  </div>

                )}

              </div>

            </div>


            {/* SUBMIT */}
            <div className="report-submit-area">

              {error && (
                <p role="alert" className="report-submit-error">
                  {error}
                </p>
              )}

              <p>
                Our support team will review your report
                and create a support ticket.
              </p>

              <button
                type="submit"
                className="submit-problem-btn"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Problem Report →"}
              </button>

            </div>

          </form>

        </div>

      </main>

    </div>
  );
}

export default ReportProblem;