import { useState } from "react";
import { signupUser } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signupUser(formData);
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
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
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✨</div>
            <h2 style={{ color: "#333", fontSize: "2rem", marginBottom: "0.5rem" }}>
              Create Account
            </h2>
            <p style={{ color: "#666" }}>Sign up to start organizing your notes</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <input 
              name="name" 
              placeholder="Full Name" 
              value={formData.name}
              onChange={handleChange}
              required
            />
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
              minLength={6}
            />
            <button 
              className="btn" 
              type="submit"
              disabled={loading}
              style={{ width: "100%", marginTop: "1rem" }}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <div style={{ 
            textAlign: "center", 
            marginTop: "1.5rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid #e0e0e0"
          }}>
            <p style={{ color: "#666" }}>
              Already have an account?{" "}
              <Link 
                to="/login" 
                style={{ 
                  color: "#667eea", 
                  textDecoration: "none",
                  fontWeight: "600"
                }}
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
