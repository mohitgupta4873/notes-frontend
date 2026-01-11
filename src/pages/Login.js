import { useState } from "react";
import { loginUser } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginUser(formData);
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      padding: "2rem"
    }}>
      <div className="container" style={{ maxWidth: "450px" }}>
        <div className="card">
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔐</div>
            <h2 style={{ color: "#333", fontSize: "2rem", marginBottom: "0.5rem" }}>
              Welcome Back
            </h2>
            <p style={{ color: "#666" }}>Sign in to continue to your notes</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <input 
              name="email" 
              type="email"
              placeholder="Email address" 
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button 
              className="btn" 
              type="submit"
              disabled={loading}
              style={{ width: "100%", marginTop: "1rem" }}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div style={{ 
            textAlign: "center", 
            marginTop: "1.5rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid #e0e0e0"
          }}>
            <p style={{ color: "#666" }}>
              Don't have an account?{" "}
              <Link 
                to="/signup" 
                style={{ 
                  color: "#667eea", 
                  textDecoration: "none",
                  fontWeight: "600"
                }}
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
