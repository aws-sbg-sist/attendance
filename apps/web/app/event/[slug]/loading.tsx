import styles from "./loading.module.css";

export default function EventLoading() {
  return (
    <main className={styles.page} aria-busy="true" aria-label="Loading event details">
      <div className={styles.shell}>
        <div className={styles.header} />
        <div className={styles.content}>
          <div className={`${styles.block} ${styles.poster}`} />
          <div className={styles.details}>
            <div className={`${styles.block} ${styles.badge}`} />
            <div className={`${styles.block} ${styles.title}`} />
            <div className={`${styles.block} ${styles.line}`} />
            <div className={`${styles.block} ${styles.line}`} />
            <div className={`${styles.block} ${styles.action}`} />
          </div>
        </div>
      </div>
    </main>
  );
}
