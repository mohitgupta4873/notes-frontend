import { Link } from "react-router-dom";

function Home() {
  const token = localStorage.getItem("token");

  return (
    <div className="container">
      <h1>📝 Notes App</h1>
      <p>
        A simple and secure notes app where you can create, edit,
        and manage your personal notes.
      </p>

      <div className="button-group">
        {!token ? (
          <>
            <Link to="/login" className="btn">
              Login
            </Link>
            <Link to="/signup" className="btn btn-outline">
              Signup
            </Link>
          </>
        ) : (
          <Link to="/dashboard" className="btn">
            Go to Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}

export default Home;
