import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../shared/ui";
import { ROUTES } from "../../shared/constants";
import { register as registerApi } from "../../shared/api/auth";
import styles from "./AuthPages.module.css";

export const RegisterPage = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    role: "customer",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.passwordConfirm) {
      setError("Пароли не совпадают.");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerApi({
        email: form.email,
        password: form.password,
        role: form.role,
      });
      setSuccess("Аккаунт создан. Теперь можно войти.");
      setTimeout(() => {
        navigate(ROUTES.LOGIN);
      }, 800);
    } catch (e) {
      if (e.data?.email?.length) {
        setError(e.data.email[0]);
      } else if (e.data?.username?.length) {
        setError(e.data.username[0]);
      } else {
        setError("Не удалось создать аккаунт. Попробуйте позже.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Регистрация в ЧувашМаркет</h1>
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
          <label className={styles.field}>
            <span>Повтор пароля</span>
            <input
              type="password"
              value={form.passwordConfirm}
              onChange={handleChange("passwordConfirm")}
              required
            />
          </label>
          <label className={styles.field}>
            <span>Тип аккаунта</span>
            <select value={form.role} onChange={handleChange("role")}>
              <option value="customer">Покупатель</option>
              <option value="seller">Продавец</option>
            </select>
          </label>
          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{success}</p>}
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? "Создаём..." : "Создать аккаунт"}
          </Button>
        </form>
        <p className={styles.helper}>
          Уже есть аккаунт? <Link to={ROUTES.LOGIN}>Войти</Link>
        </p>
      </div>
    </main>
  );
};

