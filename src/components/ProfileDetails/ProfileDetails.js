import styles from './ProfileDetails.module.css';

export default function ProfileDetails({ userData }) {
  const formatGender = (gender) => {
    if (!gender) return 'Non renseigné';
    return gender === 'male' ? 'Homme' : gender === 'female' ? 'Femme' : gender;
  };

  return (
    <div className={styles.profileCard}>
      <div className={styles.profileCardHeader}>
        <h2 className={styles.profileCardTitle}>Votre profil</h2>
        <div className={styles.divider}></div>
      </div>
      <div className={styles.profileDetails}>
        <div className={styles.profileDetail}>Âge : {userData.age}</div>
        <div className={styles.profileDetail}>Genre : {formatGender(userData.gender)}</div>
        <div className={styles.profileDetail}>Taille : {userData.height}cm</div>
        <div className={styles.profileDetail}>Poids : {userData.weight}kg</div>
      </div>
    </div>
  );
}
