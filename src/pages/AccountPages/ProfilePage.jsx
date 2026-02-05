import { useEffect, useState } from "react";
import { Button } from "../../shared/ui";
import { useAuth } from "../../shared/context/AuthContext.jsx";
import { fetchProfile, updateProfile } from "../../shared/api/account";
import styles from "./AccountPages.module.css";
import { User, Mail, Phone, MapPin, Shield, CheckCircle, AlertCircle } from "lucide-react";

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
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

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

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    
    if (message.text) {
      setMessage({ type: "", text: "" });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });

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

    setIsSaving(true);
    try {
      await updateProfile(form);
      setMessage({ type: "success", text: "Профиль успешно обновлён" });
    } catch {
      setMessage({ type: "error", text: "Не удалось сохранить профиль. Попробуйте позже." });
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "seller":
        return { label: "Продавец", color: "#3b82f6", bg: "#dbeafe" };
      case "admin":
        return { label: "Администратор", color: "#8b5cf6", bg: "#ede9fe" };
      default:
        return { label: "Покупатель", color: "#10b981", bg: "#d1fae5" };
    }
  };

  const roleBadge = user ? getRoleBadge(user.role) : null;

  if (isLoading) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Загружаем профиль…</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Личный кабинет</h1>
        <p className={styles.pageSubtitle}>Управление вашим профилем</p>
      </div>

      <div className={styles.profileGrid}>
        {/* Карточка с информацией о пользователе */}
        <section className={styles.profileInfoCard}>
          <div className={styles.profileAvatar}>
            <User size={40} strokeWidth={1.5} />
          </div>
          <div className={styles.profileInfo}>
            <h2 className={styles.profileInfoName}>
              {user?.first_name || user?.last_name
                ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
                : user?.username || "Пользователь"}
            </h2>
            {roleBadge && (
              <span
                className={styles.profileRoleBadge}
                style={{
                  color: roleBadge.color,
                  backgroundColor: roleBadge.bg,
                }}
              >
                <Shield size={14} />
                {roleBadge.label}
              </span>
            )}
          </div>

          <div className={styles.profileDetails}>
            <div className={styles.profileDetailItem}>
              <Mail size={18} />
              <div>
                <div className={styles.profileDetailLabel}>Email</div>
                <div className={styles.profileDetailValue}>
                  {user?.email || "—"}
                </div>
              </div>
            </div>
            {form.phone && (
              <div className={styles.profileDetailItem}>
                <Phone size={18} />
                <div>
                  <div className={styles.profileDetailLabel}>Телефон</div>
                  <div className={styles.profileDetailValue}>{form.phone}</div>
                </div>
              </div>
            )}
            {form.address && (
              <div className={styles.profileDetailItem}>
                <MapPin size={18} />
                <div>
                  <div className={styles.profileDetailLabel}>Адрес</div>
                  <div className={styles.profileDetailValue}>{form.address}</div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Форма редактирования */}
        <section className={styles.profileEditCard}>
          <h2 className={styles.profileEditTitle}>Редактировать профиль</h2>
          <form className={styles.profileForm} onSubmit={handleSubmit}>
            <div className={styles.profileFormField}>
              <label htmlFor="phone" className={styles.profileFormLabel}>
                <Phone size={16} />
                Телефон
              </label>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange("phone")}
                placeholder="+7"
                className={styles.profileFormInput}
              />
              {errors.phone && (
                <p className={styles.profileFormError}>
                  <AlertCircle size={14} />
                  {errors.phone}
                </p>
              )}
            </div>

            <div className={styles.profileFormField}>
              <label htmlFor="address" className={styles.profileFormLabel}>
                <MapPin size={16} />
                Адрес
              </label>
              <textarea
                id="address"
                rows={3}
                value={form.address}
                onChange={handleChange("address")}
                placeholder="Город, улица, дом, квартира…"
                className={styles.profileFormInput}
              />
              {errors.address && (
                <p className={styles.profileFormError}>
                  <AlertCircle size={14} />
                  {errors.address}
                </p>
              )}
            </div>

            {message.text && (
              <div
                className={
                  message.type === "success"
                    ? styles.profileFormSuccess
                    : styles.profileFormError
                }
              >
                {message.type === "success" ? (
                  <CheckCircle size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
                {message.text}
              </div>
            )}

            <Button type="submit" disabled={isSaving} fullWidth>
              {isSaving ? "Сохраняем..." : "Сохранить изменения"}
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
};

