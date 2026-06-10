import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: ""
  });

  const register = async () => {

    try {

      await api.post(
        "/auth/register",
        form
      );

      alert("Registered");

      navigate("/");

    } catch (err) {

      console.error(err);

      alert("Registration failed");
    }
  };

  return (
    <div>

      <h1>Register</h1>

      <input
        placeholder="Username"
        onChange={(e) =>
          setForm({
            ...form,
            username: e.target.value
          })
        }
      />

      <br />

      <input
        placeholder="Email"
        onChange={(e) =>
          setForm({
            ...form,
            email: e.target.value
          })
        }
      />

      <br />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) =>
          setForm({
            ...form,
            password: e.target.value
          })
        }
      />

      <br />

      <button onClick={register}>
        Register
      </button>

    </div>
  );
}

export default Register;