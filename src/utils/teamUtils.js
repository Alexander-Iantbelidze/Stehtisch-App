import { db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc,
  runTransaction 
} from 'firebase/firestore';

export const leaveOldTeam = async (userId, newTeamId) => {
  try {
    const teamsQuery = query(
      collection(db, "teams"),
      where("members", "array-contains", userId)
    );
    const teamsSnapshot = await getDocs(teamsQuery);

    for (const teamDoc of teamsSnapshot.docs) {
      // Team überspringen, zu dem gewechselt wird
      if (teamDoc.id === newTeamId) continue;

      const teamRef = doc(db, "teams", teamDoc.id);

      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(teamRef);
        if (!snap.exists()) return; // Falls Team gelöscht wurde

        const teamData = snap.data();
        const oldMembers = teamData.members || [];
        const newMembers = oldMembers.filter((m) => m !== userId);

        // 1) Nutzer entfernen
        transaction.update(teamRef, { members: newMembers });

        // 2) Falls dieser Nutzer Admin war, neu vergeben oder löschen
        if (teamData.adminId === userId) {
          if (newMembers.length === 0) {
            // Keine weiteren Mitglieder -> Team löschen
            transaction.delete(teamRef);
          } else {
            // Neuen Admin zufällig wählen
            const randIndex = Math.floor(Math.random() * newMembers.length);
            transaction.update(teamRef, { adminId: newMembers[randIndex] });
          }
        }
      });
    }
  } catch (error) {
    console.error("Fehler beim Verlassen alter Teams:", error);
    throw error;
  }
};
