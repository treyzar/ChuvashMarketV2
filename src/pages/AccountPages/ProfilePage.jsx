import { useEffect, useState } from "react";
import { Button } from "../../shared/ui";
import { useAuth } from "../../shared/context/AuthContext.jsx";
import { fetchProfile, updateProfile } from "../../shared/api/account";
import styles from "./AccountPages.module.css";

export const ProfilePage = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    phone: "",
    address: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setIsLoading(true);
    fetchProfile()
      .then((data) => {
        setForm({
          phone: data?.phone ?? "",
          address: data?.address ?? "",
        });
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      await updateProfile(form);
      setMessage("Профиль обновлён.");
    } catch {
      setMessage("Не удалось сохранить профиль. Попробуйте позже.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Профиль</h1>
      <section className={styles.card}>
        {user && (
          <div className={styles.profileHeader}>
            <div>
              <div className={styles.profileName}>
                {user.first_name || user.last_name
                  ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
                  : user.email || user.username}
              </div>
              <div className={styles.profileMeta}>
                {user.email} ·{" "}
                {user.role === "seller"
                  ? "Продавец"
                  : user.role === "admin"
                    ? "Администратор"
                    : "Покупатель"}
              </div>
            </div>
          </div>
        )}
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Телефон</span>
            <input
              type="tel"
              value={form.phone}
              onChange={handleChange("phone")}
              placeholder="+7"
            />
          </label>
          <label className={styles.field}>
            <span>Адрес</span>
            <textarea
              rows={3}
              value={form.address}
              onChange={handleChange("address")}
              placeholder="Город, улица, дом…"
            />
          </label>
          {message && <p className={styles.hint}>{message}</p>}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Сохраняем..." : "Сохранить"}
          </Button>
        </form>
      </section>
    </main>
  );
};

