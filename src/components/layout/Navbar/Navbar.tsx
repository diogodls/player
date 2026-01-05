import styles from "./Navbar.module.scss";

const Navbar = () => {

    return (
        <nav className={styles.navbar}>
             <img src={"../../assets/react.svg"} />


             <div className={styles.buttons}>
                <span>botao1</span>
                <span>botao2</span>
                <span>botao3</span>
             </div>
        </nav>
    );
};

export default Navbar;