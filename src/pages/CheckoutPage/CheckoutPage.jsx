import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../shared/ui";
import { useCart } from "../../shared/context/CartContext.jsx";
import { useAuth } from "../../shared/context/AuthContext.jsx";
import { createOrder } from "../../shared/api/account.js";
import { formatPrice } from "../../shared/lib";
import { ROUTES } from "../../shared/constants";
import styles from "./CheckoutPage.module.css";

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
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { items, total } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleConfirm = async () => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }

    if (!form.fullName || !form.phone || !form.address) {
      setError("Заполните все обязательные поля");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await createOrder({
        contact_name: form.fullName,
        contact_phone: form.phone,
        delivery_method: form.deliveryMethod,
        delivery_address: form.address,
      });
      setIsConfirmed(true);
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

      <ol className={styles.steps}>
        {steps.map((s) => (
          <li
            key={s.id}
            className={[
              styles.stepItem,
              step === s.id ? styles.stepItemActive : "",
              step > s.id ? styles.stepItemDone : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className={styles.stepIndex}>{s.id}</span>
            <span>{s.label}</span>
          </li>
        ))}
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
              </label>
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
                <span>Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  placeholder="you@example.com"
                />
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

              {!isConfirmed && (
                <Button
                  fullWidth
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Создание заказа..." : "Подтвердить заказ"}
                </Button>
              )}

              {isConfirmed && (
                <div className={styles.success}>
                  <h2>✓ Заказ оформлен!</h2>
                  <p>
                    Спасибо за ваш заказ! Наша команда свяжется с вами по
                    указанному номеру телефона.
                  </p>
                  <p style={{ fontSize: "0.9em", color: "#666" }}>
                    Статус заказа можно отследить в разделе «Мои заказы».
                  </p>
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => navigate(ROUTES.HOME)}
                  >
                    Вернуться на главную
                  </Button>
                </div>
              )}
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
    </main>
  );
};
