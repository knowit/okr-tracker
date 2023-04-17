import { db, serverTimestamp } from '@/config/firebaseConfig';
import store from '@/store';

/**
 * Writes a log recording a user-visit to an item (dep, org, objective)
 * @param {*} slugRef A reference to the item the user is visiting
 */
const writeLog = async (slugRef) => {
  let isTeamMember = false;

  const hashedUser = await hash(store.state.user.email);
  if (hashedTeamMembers.includes(hashedUser)) {
    isTeamMember = true;
  }
  const logsCollection = db.collection('logs');
  const randomId = Math.random() * 500;
  const docId = await hash(serverTimestamp() + Math.floor(randomId).toString());
  const logData = {
    userId: hashedUser,
    itemVisited: slugRef,
    timeOfAction: serverTimestamp(),
    teamMember: isTeamMember,
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

// Temporary solution to annotate the activities of team members differently than normal users
// Manually hashed the email of the team members to generate these hashes
const hashedTeamMembers = [
  'e3822c497492b087ce4573615605dda2b168a7a6f621759fb65a98039f63d6fb',
  'edb89524d395f5dac6ffc984920e89aa9e8e4417d16f8d14ae4990f5fd32e74f',
  '93abb1da4c110bb228bfe623b8ed604c9fad7d25aa506ae1dc0e7c796be4ce6b',
  '6e5ac31bec2e81461df07c9b936d948fa1d70053e6cb8f19a4bed1724034a0ca',
  'ef1f1cc4d470a5239a215011606fb8a84092c274f9c3ec64f46e570a98615c04',
  'e129e4911523cb951b069408c88026056c19a2a382040b9b4d08e5737973900e',
];

export default writeLog;
