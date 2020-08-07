const admin = require('firebase-admin');
const d3 = require('d3');

const db = admin.firestore();

/**
 * Listens for changes in progress for a key result. Updates the 'progression' Field for
 * the key result accordingly
 *
 * TODO: Handle the key result progression when start or target values for a key result are changed
 */
module.exports = async function handleKeyResultProgress(change, { params }) {
  const { keyResultId } = params;
  const keyResultRef = db.doc(`keyResults/${keyResultId}`);

  const { startValue, targetValue, objective } = await keyResultRef.get().then(snapshot => snapshot.data());
  const currentValue = await keyResultRef
    .collection('progress')
    .orderBy('timestamp', 'desc')
    .limit(1)
    .get()
    .then(snapshot => snapshot.docs)
    .then(docs => (docs.length ? docs[0].data().value : startValue));

  const scale = d3.scaleLinear().domain([startValue, targetValue]).clamp(true);
  const progression = scale(currentValue);

  await keyResultRef.update({ currentValue, progression });

  updateObjectiveProgression(objective);
};

/**
 * Updates the progression for the related Objective once
 * the key result progression has been updated
 */
async function updateObjectiveProgression({ path }) {
  const objectiveRef = db.doc(path);

  // Finds all progression for related key results and returns the average
  // TODO: handle weighting of key results here
  const progression = await db
    .collection('keyResults')
    .where('archived', '==', false)
    .where('objective', '==', objectiveRef)
    .get()
    .then(({ docs }) => docs.map(doc => doc.data().progression))
    .then(d3.mean);

  await objectiveRef.update({ progression });

  // TODO: Update progression for Items or Periods
  // updatePeriodProgression()
}
