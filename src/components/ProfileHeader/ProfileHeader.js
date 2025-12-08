import styles from './ProfileHeader.module.css';

export default function ProfileHeader({ userData }) {
  return (
    <div className={styles.profileHeader}>
      <div className={styles.profilePicture}>
        <img src={userData.profilePicture} alt={`${userData.firstName} ${userData.lastName}`} />
      </div>
      <div className={styles.profileInfo}>
        <h1 className={styles.profileName}>{userData.firstName} {userData.lastName}</h1>
        <p className={styles.profileDate}>Membre depuis le {userData.createdAt}</p>
      </div>
    </div>
  );
}
