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
  const [errors, setErrors] = useState({
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

  const normalizePhone = (raw) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return "";

    let normalized = digits;

    if (normalized[0] === "8") {
      normalized = "7" + normalized.slice(1);
    }

    if (normalized[0] !== "7") {
      normalized = "7" + normalized;
    }

    // максимум 11 цифр: 7XXXXXXXXXX
    normalized = normalized.slice(0, 11);

    return `+${normalized}`;
  };

  const isValidPhone = (value) => /^\+7\d{10}$/.test(value);

  const handleChange = (field) => (event) => {
    const value = event.target.value;

    setForm((prev) => ({
      ...prev,
      [field]: field === "phone" ? normalizePhone(value) : value,
    }));

    // Сбрасываем ошибку поля при изменении
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    const validationErrors = {};

    if (!form.phone) {
      validationErrors.phone = "Укажите номер телефона";
    } else if (!isValidPhone(form.phone)) {
      validationErrors.phone = "Неверный формат. Используйте формат +7XXXXXXXXXX";
    }

    if (!form.address.trim()) {
      validationErrors.address = "Укажите адрес";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
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
          {errors.phone && <p className={styles.error}>{errors.phone}</p>}
          <label className={styles.field}>
            <span>Адрес</span>
            <textarea
              rows={3}
              value={form.address}
              onChange={handleChange("address")}
              placeholder="Город, улица, дом…"
            />
          </label>
          {errors.address && <p className={styles.error}>{errors.address}</p>}
          {message && <p className={styles.hint}>{message}</p>}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Сохраняем..." : "Сохранить"}
          </Button>
        </form>
      </section>
    </main>
  );
};

