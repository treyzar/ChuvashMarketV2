import styles from "./Button.module.css";

export const Button = ({
  children,
  variant = "primary",
  fullWidth = false,
  className = "",
  ...props
}) => {
  const classes = [
    styles.button,
    styles[variant] ?? styles.primary,
    fullWidth ? styles.fullWidth : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

