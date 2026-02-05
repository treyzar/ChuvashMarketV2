import React, { useEffect, useRef, useState } from "react";
import styles from "./Toast.module.css";
import { Button } from "../../shared/ui";

export const DraftToast = ({
  onRestore,
  onDelete,
  onClose,
  duration = 5000,
}) => {
  const [progress, setProgress] = useState(0); // 0..100
  const startedAt = useRef(Date.now());
  const rafRef = useRef(null);
  const paused = useRef(false);

  useEffect(() => {
    startedAt.current = Date.now();

    const tick = () => {
      if (paused.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const elapsed = Date.now() - startedAt.current;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      if (pct >= 100) {
        // auto close
        onClose?.();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  return (
    <div
      className={styles.toast}
      role="status"
      aria-live="polite"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      <div className={styles.content}>
        <div className={styles.message}>Найден черновик заказа</div>
        <div className={styles.actions}>
          <Button variant="ghost" onClick={onRestore}>
            Восстановить
          </Button>
          <Button variant="secondary" onClick={onDelete}>
            Удалить
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Закрыть
          </Button>
        </div>
      </div>
      <div className={styles.progress} aria-hidden>
        <div
          className={styles.progressFill}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
