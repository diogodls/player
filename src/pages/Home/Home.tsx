import DescriptiveText from "../../components/Home/DescritiveText/DescriptiveText.tsx";
import styles from './Home.module.scss';

const Home = () => {
  return (
    <div className={styles.container}>
      <DescriptiveText />
    </div>
  );
}

export default Home;