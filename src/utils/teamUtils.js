import { db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  arrayRemove, 
  getDoc, 
  deleteDoc 
} from 'firebase/firestore';

/**
 * Entferne den User aus allen Teams, in denen er Mitglied/Admin ist, außer 'newTeamId'.
 * - Wenn der User Admin war und das Team noch andere Mitglieder hat: Admin wird neu zufällig ernannt.
 * - Sind keine Mitglieder mehr übrig, wird das Team gelöscht.
 */
export const leaveOldTeam = async (userId, newTeamId) => {
  try {
    // Alle Teams finden, in denen der Benutzer (als Member) eingetragen ist
    const teamsQuery = query(
      collection(db, 'teams'),
      where('members', 'array-contains', userId)
    );
    const teamsSnapshot = await getDocs(teamsQuery);

    for (const teamDoc of teamsSnapshot.docs) {
      // Überspringe das Team, zu dem gerade gewechselt wird
      if (teamDoc.id === newTeamId) continue;

      const teamData = teamDoc.data();
      const teamRef = doc(db, 'teams', teamDoc.id);

      // 1) Nutzer als Mitglied entfernen
      await updateDoc(teamRef, {
        members: arrayRemove(userId),
      });

      // 2) Falls dieser User Admin war, neu vergeben oder Team löschen
      if (teamData.adminId === userId) {
        const updatedSnap = await getDoc(teamRef);
        if (!updatedSnap.exists()) {
          continue; // Team ist währenddessen evtl. gelöscht
        }
        const updatedTeam = updatedSnap.data();
        const remainingMembers = updatedTeam.members || [];
        
        if (remainingMembers.length === 0) {
          // Keine Mitglieder mehr -> Team löschen
          await deleteDoc(teamRef);
          continue;
        } else {
          // Neuen Admin zufällig wählen
          const randIndex = Math.floor(Math.random() * remainingMembers.length);
          await updateDoc(teamRef, { adminId: remainingMembers[randIndex] });
        }
      }
    }
  } catch (error) {
    console.error('Fehler beim Verlassen alter Teams:', error);
    throw error;
  }
};