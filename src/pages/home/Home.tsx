import DescritiveText from "../../components/DescritiveText/DescritiveText.tsx";
import styles from './Home.module.scss';

export default function Home() {
  return (
    <div className={styles.container}>
  <div className={styles.content}>
    <DescritiveText />
  </div>
</div>

  );
}
