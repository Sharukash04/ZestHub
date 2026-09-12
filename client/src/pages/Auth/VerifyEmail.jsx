import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./VerifyEmail.css";

function VerifyEmail() {
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/auth/verify-email?token=${encodeURIComponent(token)}`
        );

        setStatus("success");
        setMessage(
          response.data.message || "Your email has been verified successfully."
        );
      } catch (error) {
        setStatus("error");

        const errorMessage =
          error.response?.data?.detail ||
          "This verification link is invalid or has expired.";

        setMessage(errorMessage);
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="verify-page">
      <div className="verify-card">
        <div className="verify-icon">
          {status === "loading" && "⏳"}
          {status === "success" && "✅"}
          {status === "error" && "❌"}
        </div>

        <h1>
          {status === "loading" && "Verifying Email"}
          {status === "success" && "Email Verified!"}
          {status === "error" && "Verification Failed"}
        </h1>

        <p>{message}</p>

        {status === "loading" && (
          <div className="verify-loader">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}

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

        <div className="verify-brand">
          <span>🍽️</span>
          <strong>ZestHub</strong>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;