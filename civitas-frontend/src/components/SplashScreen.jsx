import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SplashScreen.module.css';

function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/home'), 3500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <div className={styles.logoRing}>
          <img
            src={`${process.env.PUBLIC_URL}/images/logo2.PNG`}
            alt="Civitas"
            className={styles.logo}
          />
        </div>
        <h1 className={styles.title}>CIVITAS</h1>
        <p className={styles.tagline}>Empowering Citizens · Building Communities</p>
        <div className={styles.loader}>
          <div className={styles.loaderBar}></div>
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;

