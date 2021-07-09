const firebase = require('firebase-admin');
const getSheetsData = require('../util/getSheetsData');

module.exports = async function FetchKpiDataOnUpdate(doc) {
  if (!doc || !doc.ref || !doc.ref.update) {
    throw new Error('Invalid document');
  }

  const { ref } = doc;

  try {
    const { api } = doc.data();

    if (api) {
      await ref.update({ error: firebase.firestore.FieldValue.delete(), valid: true });
      return true;
    }

    const value = await getSheetsData(doc.data());

    // eslint-disable-next-line no-restricted-globals
    if (!value || isNaN(value)) {
      return ref.update({ error: 'Invalid data returned' });
    }

    await ref.collection('progress').add({ value, timestamp: new Date() });
    await ref.update({ error: firebase.firestore.FieldValue.delete(), currentValue: value, valid: true });

    return true;
  } catch ({ message }) {
    return ref.update({ error: message, valid: false });
  }
};
