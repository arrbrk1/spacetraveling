import Link from 'next/link';
import styles from './header.module.scss';
import commonStyles from '../../styles/common.module.scss';

const Header: React.FC = () => {
  return (
    <header className={` ${commonStyles.layout} ${styles.container}`}>
      <Link href="/" passHref>
        <a className={styles.img}>
          <img src="/logo.svg" alt="logo" />
        </a>
      </Link>
    </header>
  );
};

export default Header;
