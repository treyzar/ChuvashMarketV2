import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../shared/ui";
import { ROUTES } from "../../shared/constants";
import { register as registerApi } from "../../shared/api/auth";
import { Mail, Lock, UserPlus, AlertCircle, CheckCircle, ShoppingBag, Store } from "lucide-react";
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
    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.passwordConfirm) {
      setError("Пароли не совпадают.");
      return;
    }

    if (form.password.length < 6) {
      setError("Пароль должен содержать минимум 6 символов.");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerApi({
        email: form.email,
        password: form.password,
        role: form.role,
      });
      setSuccess("Аккаунт создан. Перенаправляем на страницу входа...");
      setTimeout(() => {
        navigate(ROUTES.LOGIN);
      }, 1500);
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
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper}>
              <UserPlus size={28} strokeWidth={2} />
            </div>
            <h1 className={styles.title}>Создать аккаунт</h1>
            <p className={styles.subtitle}>Присоединяйтесь к ЧувашМаркет</p>
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
                placeholder="Минимум 6 символов"
                className={styles.input}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                <Lock size={16} />
                <span>Повторите пароль</span>
              </label>
              <input
                type="password"
                value={form.passwordConfirm}
                onChange={handleChange("passwordConfirm")}
                placeholder="Повторите пароль"
                className={styles.input}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                <span>Тип аккаунта</span>
              </label>
              <div className={styles.roleSelector}>
                <label className={`${styles.roleOption} ${form.role === "customer" ? styles.roleOptionActive : ""}`}>
                  <input
                    type="radio"
                    name="role"
                    value="customer"
                    checked={form.role === "customer"}
                    onChange={handleChange("role")}
                  />
                  <div className={styles.roleContent}>
                    <ShoppingBag size={24} />
                    <div>
                      <div className={styles.roleTitle}>Покупатель</div>
                      <div className={styles.roleDescription}>Покупайте товары</div>
                    </div>
                  </div>
                </label>

                <label className={`${styles.roleOption} ${form.role === "seller" ? styles.roleOptionActive : ""}`}>
                  <input
                    type="radio"
                    name="role"
                    value="seller"
                    checked={form.role === "seller"}
                    onChange={handleChange("role")}
                  />
                  <div className={styles.roleContent}>
                    <Store size={24} />
                    <div>
                      <div className={styles.roleTitle}>Продавец</div>
                      <div className={styles.roleDescription}>Продавайте товары</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {error && (
              <div className={styles.errorBox}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className={styles.successBox}>
                <CheckCircle size={16} />
                <span>{success}</span>
              </div>
            )}

            <Button type="submit" fullWidth disabled={isSubmitting}>
              {isSubmitting ? "Создаём..." : "Создать аккаунт"}
            </Button>
          </form>

          <div className={styles.divider}>
            <span>или</span>
          </div>

          <p className={styles.helper}>
            Уже есть аккаунт?{" "}
            <Link to={ROUTES.LOGIN} className={styles.link}>
              Войти
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

