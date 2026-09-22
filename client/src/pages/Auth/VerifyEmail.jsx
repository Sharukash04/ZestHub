import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./VerifyEmail.css";

function VerifyEmail() {
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [status, setStatus] = useState(
    token ? "loading" : "error"
  );

  const [message, setMessage] = useState(
    token
      ? "Verifying your email..."
      : "Verification token is missing."
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;

    const verifyEmail = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/auth/verify-email?token=${encodeURIComponent(
            token
          )}`
        );

        if (cancelled) {
          return;
        }

        setStatus("success");

        setMessage(
          response.data.message ||
            "Your email has been verified successfully."
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        setStatus("error");

        const errorMessage =
          error.response?.data?.detail ||
          "This verification link is invalid or has expired.";

        setMessage(errorMessage);
      }
    };

    verifyEmail();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="verify-page">
      <div className="verify-card">
        <div className="verify-icon">
          {status === "loading" && "⏳"}
          {status === "success" && "✅"}
          {status === "error" && "⚠️"}
        </div>

        <div className="verify-content">
          <h1>
            {status === "loading" && "Verifying Email"}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
          </h1>

          <p>{message}</p>

          {status === "success" && (
            <Link to="/login" className="verify-button">
              Continue to Login
            </Link>
          )}

          {status === "error" && (
            <Link to="/login" className="verify-button">
              Back to Login
            </Link>
          )}

          {status === "loading" && (
            <div className="verify-loading">
              Please wait...
            </div>
          )}
        </div>

        <div className="verify-brand">
          <span>🍽️</span>
          <strong>ZestHub</strong>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
