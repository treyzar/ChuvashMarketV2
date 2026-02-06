import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../shared/ui";
import { ROUTES } from "../../shared/constants";
import { login as loginApi } from "../../shared/api/auth";
import { useAuth } from "../../shared/context/AuthContext.jsx";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import styles from "./AuthPages.module.css";

export const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { saveTokens } = useAuth();

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    if (error) setError("");
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
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper}>
              <LogIn size={28} strokeWidth={2} />
            </div>
            <h1 className={styles.title}>Вход в аккаунт</h1>
            <p className={styles.subtitle}>Добро пожаловать в ЧувашМаркет</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label}>
                <Mail size={16} />
                <span>Email адрес</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                placeholder="example@mail.com"
                className={styles.input}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                <Lock size={16} />
                <span>Пароль</span>
              </label>
              <input
                type="password"
                value={form.password}
                onChange={handleChange("password")}
                placeholder="••••••••"
                className={styles.input}
                required
              />
            </div>

            {error && (
              <div className={styles.errorBox}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" fullWidth disabled={isSubmitting}>
              {isSubmitting ? "Входим..." : "Войти"}
            </Button>
          </form>

          <div className={styles.divider}>
            <span>или</span>
          </div>

          <p className={styles.helper}>
            Нет аккаунта?{" "}
            <Link to={ROUTES.REGISTER} className={styles.link}>
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};
