import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const login = async () => {
    try {
      setLoading(true);

      const res = await api.post(
        "/auth/login",
        {
          email,
          password,
        }
      );

      console.log("LOGIN RESPONSE =>", res.data);

      localStorage.setItem(
        "token",
        res.data.access_token
      );

      /*
       TEMPORARY
       until backend returns user info
      */

      if (email === "user1@gmail.com") {
        localStorage.setItem("user_id", "1");
        localStorage.setItem("username", "user1");
      }

      if (email === "user2@gmail.com") {
        localStorage.setItem("user_id", "2");
        localStorage.setItem("username", "user2");
      }

      navigate("/chat");
    } catch (err) {
      console.error(err);

      alert("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        background: "#f0f2f5",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "400px",
          background: "#fff",
          padding: "40px",
          borderRadius: "12px",
          boxShadow:
            "0px 5px 20px rgba(0,0,0,0.15)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "30px",
            color: "#128C7E",
          }}
        >
          Chat App
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "15px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />

        <button
          onClick={login}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            border: "none",
            borderRadius: "8px",
            background: "#128C7E",
            color: "#fff",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          {loading
            ? "Logging in..."
            : "Login"}
        </button>

        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
          }}
        >
          <Link to="/register">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;