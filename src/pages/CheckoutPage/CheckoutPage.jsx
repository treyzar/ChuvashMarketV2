import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../shared/ui";
import { useCart } from "../../shared/context/CartContext.jsx";
import { useAuth } from "../../shared/context/AuthContext.jsx";
import { createOrder } from "../../shared/api/account.js";
import { formatPrice } from "../../shared/lib";
import { Check } from "lucide-react";
import { ROUTES } from "../../shared/constants";
import styles from "./CheckoutPage.module.css";
import { DraftToast } from "../../widgets/Toast/Toast";

const steps = [
  { id: 1, label: "Контактные данные" },
  { id: 2, label: "Способ доставки" },
  { id: 3, label: "Подтверждение" },
];

export const CheckoutPage = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    deliveryMethod: "pickup",
    comment: "",
  });
  const [hasDraft, setHasDraft] = useState(false);
  const DRAFT_KEY = "checkout_draft";
  const [errors, setErrors] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
  });
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { items, total, addToCart, removeCartItem, refreshCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

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

  const isValidEmail = (value) =>
    !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleChange = (field) => (event) => {
    const value = event.target.value;

    setForm((prev) => ({
      ...prev,
      [field]: field === "phone" ? normalizePhone(value) : value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  // Draft persistence
  const saveDraft = () => {
    try {
      const payload = {
        form,
        step,
        items: items.map((it) => ({
          id: it.id,
          product: it.product,
          quantity: it.quantity,
        })),
        updated_at: Date.now(),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
      setHasDraft(true);
    } catch (e) {}
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      setHasDraft(false);
    } catch (e) {}
  };

  // save on form/step/items change and on unload
  useEffect(() => {
    saveDraft();
    const onUnload = () => saveDraft();
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [form, step, items]);

  // check existing draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) setHasDraft(true);
    } catch (e) {}
  }, []);

  const restoreDraft = async () => {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try {
      const d = JSON.parse(raw);

      // remove current items
      try {
        await Promise.all(
          items.map((it) => removeCartItem(it.id).catch(() => {})),
        );
      } catch (e) {}

      if (d.items && Array.isArray(d.items)) {
        for (const it of d.items) {
          try {
            // eslint-disable-next-line no-await-in-loop
            await addToCart(it.product, it.quantity ?? 1);
          } catch (e) {}
        }
      }

      if (d.form) setForm(d.form);
      if (d.step) setStep(d.step);
      setHasDraft(false);
    } catch (e) {}
  };

  const deleteDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch (e) {}
    setHasDraft(false);
  };

  const closeDraftToast = () => setHasDraft(false);

  const handleConfirm = async () => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }

    const fieldErrors = {};

    if (!form.fullName.trim()) {
      fieldErrors.fullName = "Укажите ФИО";
    }

    if (!form.phone) {
      fieldErrors.phone = "Укажите номер телефона";
    } else if (!isValidPhone(form.phone)) {
      fieldErrors.phone = "Неверный формат. Используйте формат +7XXXXXXXXXX";
    }

    if (!form.address.trim()) {
      fieldErrors.address = "Укажите адрес доставки";
    }

    if (!isValidEmail(form.email)) {
      fieldErrors.email = "Неверный формат email";
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      setError("Заполните корректно все обязательные поля");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const order = await createOrder({
        contact_name: form.fullName,
        contact_phone: form.phone,
        delivery_method: form.deliveryMethod,
        delivery_address: form.address,
      });
      
      // Обновляем корзину после успешного создания заказа
      await refreshCart();
      
      setIsConfirmed(true);
      // clear draft on success
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch (e) {}
    } catch (err) {
      console.error("Ошибка при создании заказа:", err);
      setError(
        err.data?.detail || "Не удалось создать заказ. Попробуйте позже.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!items.length && !isConfirmed) {
    return (
      <main className={styles.page}>
        <h1 className={styles.title}>Оформление заказа</h1>
        <p className={styles.hint}>
          Ваша корзина пуста. Добавьте товары и вернитесь к оформлению.
        </p>
        <Button onClick={() => navigate(ROUTES.PRODUCTS)}>
          Перейти в каталог
        </Button>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Оформление заказа</h1>
      {hasDraft && (
        <DraftToast
          onRestore={restoreDraft}
          onDelete={deleteDraft}
          onClose={closeDraftToast}
        />
      )}
      
      {isConfirmed ? (
        <div className={styles.successContainer}>
          <div className={styles.successIcon}>
            <Check size={48} strokeWidth={3} />
          </div>
          <h2 className={styles.successTitle}>Заказ успешно оформлен!</h2>
          <p className={styles.successMessage}>
            Спасибо за ваш заказ! Мы получили вашу заявку и скоро свяжемся с вами по указанному номеру телефона.
          </p>
          <div className={styles.successDetails}>
            <div className={styles.successDetailItem}>
              <span className={styles.successDetailLabel}>Контактное лицо:</span>
              <span className={styles.successDetailValue}>{form.fullName}</span>
            </div>
            <div className={styles.successDetailItem}>
              <span className={styles.successDetailLabel}>Телефон:</span>
              <span className={styles.successDetailValue}>{form.phone}</span>
            </div>
            <div className={styles.successDetailItem}>
              <span className={styles.successDetailLabel}>Адрес доставки:</span>
              <span className={styles.successDetailValue}>{form.address}</span>
            </div>
          </div>
          <p className={styles.successHint}>
            Статус заказа можно отследить в разделе «Мои заказы»
          </p>
          <div className={styles.successActions}>
            <Button
              fullWidth
              onClick={() => navigate(ROUTES.ORDERS)}
            >
              Перейти к моим заказам
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => navigate(ROUTES.HOME)}
            >
              Вернуться на главную
            </Button>
          </div>
        </div>
      ) : (
        <>
          <ol className={styles.steps}>
            {steps.map((s) => {
              const isDone = step > s.id;
              const isActive = step === s.id;
              const classes = [styles.stepItem];
              if (isActive) classes.push(styles.stepItemActive);
              if (isDone)
                classes.push(styles.stepItemDone, styles.stepItemClickable);

              return (
                <li
                  key={s.id}
                  className={classes.filter(Boolean).join(" ")}
                  onClick={isDone ? () => setStep(s.id) : undefined}
                  role={isDone ? "button" : undefined}
                  tabIndex={isDone ? 0 : -1}
                  onKeyDown={
                    isDone
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") setStep(s.id);
                        }
                      : undefined
                  }
                >
                  <span className={styles.stepIndex}>{s.id}</span>
                  <span>{s.label}</span>
                </li>
              );
            })}
          </ol>

          <section className={styles.layout}>
            <div className={styles.form}>
              {step === 1 && (
                <>
                  <label className={styles.field}>
                    <span>ФИО</span>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={handleChange("fullName")}
                      placeholder="Иван Иванов"
                    />
                    {errors.fullName && (
                      <p className={styles.error}>{errors.fullName}</p>
                    )}
                  </label>
                  <label className={styles.field}>
                    <span>Телефон</span>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={handleChange("phone")}
                      placeholder="+7"
                    />
                    {errors.phone && <p className={styles.error}>{errors.phone}</p>}
                  </label>
                  <label className={styles.field}>
                    <span>Email</span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={handleChange("email")}
                      placeholder="you@example.com"
                    />
                    {errors.email && <p className={styles.error}>{errors.email}</p>}
                  </label>
                </>
              )}

              {step === 2 && (
                <>
                  <label className={styles.field}>
                    <span>Способ доставки</span>
                    <select
                      value={form.deliveryMethod}
                      onChange={handleChange("deliveryMethod")}
                    >
                      <option value="pickup">Самовывоз</option>
                      <option value="courier">Курьер по адресу</option>
                      <option value="post">Доставка Почтой России</option>
                    </select>
                  </label>

                  <label className={styles.field}>
                    <span>Адрес доставки</span>
                    <textarea
                      rows={3}
                      value={form.address}
                      onChange={handleChange("address")}
                      placeholder="Город, улица, дом, подъезд…"
                    />
                    {errors.address && (
                      <p className={styles.error}>{errors.address}</p>
                    )}
                  </label>
                </>
              )}

              {step === 3 && (
                <>
                  {error && <p style={{ color: "red" }}>{error}</p>}
                  <p className={styles.hint}>
                    Проверьте данные перед подтверждением заказа.
                  </p>
                  <label className={styles.field}>
                    <span>Комментарий к заказу (опционально)</span>
                    <textarea
                      rows={3}
                      value={form.comment}
                      onChange={handleChange("comment")}
                      placeholder="Например: позвонить за час до доставки"
                    />
                  </label>

                  <Button
                    fullWidth
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Создание заказа..." : "Подтвердить заказ"}
                  </Button>
                </>
              )}

              <div className={styles.formFooter}>
                {step > 1 && (
                  <Button variant="secondary" onClick={prevStep}>
                    Назад
                  </Button>
                )}
                {step < 3 && <Button onClick={nextStep}>Продолжить</Button>}
              </div>
            </div>

            <aside className={styles.sidebar}>
              <div className={styles.summary}>
                <h2>Ваш заказ</h2>
                <ul className={styles.summaryList}>
                  {items.map((item) => (
                    <li key={item.id}>
                      <span>
                        {item.product.name} × {item.quantity}
                      </span>
                      <span>
                        {formatPrice(
                          (item.product.price ?? 0) * (item.quantity ?? 0),
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className={styles.summaryRow}>
                  <span>Итого</span>
                  <span className={styles.summaryTotal}>{formatPrice(total)}</span>
                </div>
              </div>
            </aside>
          </section>
        </>
      )}
    </main>
  );
};
