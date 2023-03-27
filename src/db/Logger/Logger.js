import { db, serverTimestamp } from '@/config/firebaseConfig';
import store from '@/store';

/**
 * Writes a log recording a user-visit to an item (dep, org, objective)
 * @param {*} slugRef A reference to the item the user is visiting
 */
export const writeLog = async (slugRef) => {
  const hashedUser = await hash(store.state.user.email);
  const logsCollection = db.collection('logs');
  const randomId = Math.random() * 20;
  const docId = await hash(serverTimestamp() + randomId.toString());
  const logData = {
    userId: hashedUser,
    itemVisited: slugRef,
    timeOfAction: serverTimestamp(),
  };

  logsCollection
    .doc(docId)
    .set(logData)
    .catch((error) => {
      throw new Error(error);
    });
};

async function hash(string) {
  const utf8 = new TextEncoder().encode(string);
  return crypto.subtle.digest('SHA-256', utf8).then((hashBuffer) => {
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((bytes) => bytes.toString(16).padStart(2, '0'))
      .join('');
    return hashHex;
  });
}
