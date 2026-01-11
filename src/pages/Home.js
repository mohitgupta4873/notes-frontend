import { Link } from "react-router-dom";

function Home() {
  const token = localStorage.getItem("token");

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      padding: "2rem"
    }}>
      <div className="container" style={{ 
        textAlign: "center",
        maxWidth: "800px"
      }}>
        <div style={{ 
          fontSize: "5rem", 
          marginBottom: "1rem",
          animation: "float 3s ease-in-out infinite"
        }}>
          📝
        </div>
        <h1 style={{ 
          fontSize: "3.5rem", 
          fontWeight: "700",
          color: "white",
          marginBottom: "1.5rem",
          textShadow: "0 4px 20px rgba(0,0,0,0.3)"
        }}>
          Notes App
        </h1>
        <p style={{ 
          fontSize: "1.3rem", 
          color: "rgba(255,255,255,0.95)",
          marginBottom: "2rem",
          lineHeight: "1.8",
          textShadow: "0 2px 10px rgba(0,0,0,0.2)"
        }}>
          A beautiful and secure notes app where you can create, edit,
          and manage your personal notes with ease. Organize your thoughts
          and ideas in one place.
        </p>

        <div className="button-group">
          {!token ? (
            <>
              <Link to="/login" className="btn" style={{ fontSize: "1.1rem", padding: "16px 32px" }}>
                Login
              </Link>
              <Link to="/signup" className="btn btn-outline" style={{ fontSize: "1.1rem", padding: "16px 32px" }}>
                Sign Up
              </Link>
            </>
          ) : (
            <Link to="/dashboard" className="btn" style={{ fontSize: "1.1rem", padding: "16px 32px" }}>
              Go to Dashboard
            </Link>
          )}
        </div>

        <div style={{ 
          marginTop: "4rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "2rem",
          textAlign: "left"
        }}>
          <div className="card" style={{ padding: "1.5rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✨</div>
            <h3 style={{ color: "#333", marginBottom: "0.5rem" }}>Easy to Use</h3>
            <p style={{ color: "#666", fontSize: "0.9rem" }}>
              Intuitive interface designed for simplicity and efficiency
            </p>
          </div>
          <div className="card" style={{ padding: "1.5rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔒</div>
            <h3 style={{ color: "#333", marginBottom: "0.5rem" }}>Secure</h3>
            <p style={{ color: "#666", fontSize: "0.9rem" }}>
              Your notes are protected with secure authentication
            </p>
          </div>
          <div className="card" style={{ padding: "1.5rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚡</div>
            <h3 style={{ color: "#333", marginBottom: "0.5rem" }}>Fast</h3>
            <p style={{ color: "#666", fontSize: "0.9rem" }}>
              Quick access to all your notes whenever you need them
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
