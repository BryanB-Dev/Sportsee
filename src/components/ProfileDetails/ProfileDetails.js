import styles from './ProfileDetails.module.css';

export default function ProfileDetails({ userData }) {
  return (
    <div className={styles.profileCard}>
      <div className={styles.profileCardHeader}>
        <h2 className={styles.profileCardTitle}>Votre profil</h2>
        <div className={styles.divider}></div>
      </div>
      <div className={styles.profileDetails}>
        <div className={styles.profileDetail}>Âge : {userData.age}</div>
        <div className={styles.profileDetail}>Genre : Femme</div>
        <div className={styles.profileDetail}>Taille : {userData.height}cm</div>
        <div className={styles.profileDetail}>Poids : {userData.weight}kg</div>
      </div>
    </div>
  );
}
