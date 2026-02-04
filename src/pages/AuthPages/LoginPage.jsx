import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../shared/ui";
import { ROUTES } from "../../shared/constants";
import { login as loginApi } from "../../shared/api/auth";
import { useAuth } from "../../shared/context/AuthContext.jsx";
import styles from "./AuthPages.module.css";

export const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { saveTokens } = useAuth();

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const data = await loginApi({ email: form.email, password: form.password });
      if (data?.access) {
        saveTokens(data.access, data.refresh);
        navigate(ROUTES.HOME);
      } else {
        setError("Не удалось войти. Попробуйте ещё раз.");
      }
    } catch (e) {
      if (e.status === 401) {
        setError("Неверный email или пароль.");
      } else {
        setError("Ошибка при входе. Попробуйте позже.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Вход в ЧувашМаркет</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Email</span>
            <input
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              required
            />
          </label>
          <label className={styles.field}>
            <span>Пароль</span>
            <input
              type="password"
              value={form.password}
              onChange={handleChange("password")}
              required
            />
          </label>
          {error && <p className={styles.error}>{error}</p>}
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? "Входим..." : "Войти"}
          </Button>
        </form>
        <p className={styles.helper}>
          Нет аккаунта?{" "}
          <Link to={ROUTES.REGISTER}>Зарегистрироваться</Link>
        </p>
      </div>
    </main>
  );
};

