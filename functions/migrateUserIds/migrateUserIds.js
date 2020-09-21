const functions = require('firebase-functions');
const admin = require('firebase-admin');

const config = require('../config');

const db = admin.firestore();

const from = '@origo.oslo.kommune.no';
const to = '@byr.oslo.kommune.no';

exports.migrateUserIds = functions.region(config.region).https.onRequest(async (req, res) => {
  try {
    await replaceUserDocuments();
    await replaceTeams();
    await processCollectionGroups();
    await processAudit();
    res.status(200).send('Success');
  } catch (err) {
    res.status(500).send(`500: Something went wrong<br><br>${err}`);
  }
});

async function replaceUserDocuments() {
  const users = db.collection('users');
  const userRefs = await users.get().then(({ docs }) => docs);
  const userData = userRefs.map((doc) => ({
    ...doc.data(),
    id: doc.id.replace(from, to),
    email: doc.id.replace(from, to),
  }));

  await Promise.all(userRefs.map(({ ref }) => ref.delete()));

  userData.forEach((obj) => {
    users.doc(obj.id).set(obj);
  });
}

async function replaceTeams() {
  const users = db.collection('users');
  const products = db.collectionGroup('products');
  const productRefs = await products.get().then(({ docs }) => docs);

  if (!productRefs.length) return;

  return Promise.all(
    productRefs.map((doc) => {
      const { team: existingTeam } = doc.data();
      const team = existingTeam.map(({ id }) => users.doc(id.replace(from, to))) || [];

      return doc.ref.update({ team });
    })
  );
}

async function processCollectionGroups() {
  const collectionGroups = ['orgs', 'periods', 'departments', 'products', 'keyResults', 'objectives', 'progress'];

  try {
    Promise.all(
      collectionGroups.map((group) => {
        return db
          .collectionGroup(group)
          .get()
          .then(({ docs }) => docs)
          .then(replaceCreatedAndEdited);
      })
    );
  } catch {
    return false;
  }
}

async function replaceCreatedAndEdited(list) {
  const users = db.collection('users');

  list.forEach((doc) => {
    const { editedBy, createdBy } = doc.data();

    if (createdBy && createdBy.id) {
      const userRef = users.doc(createdBy.id.replace(from, to));
      doc.ref.update({ createdBy: userRef });
    }

    if (editedBy && editedBy.id) {
      const userRef = users.doc(editedBy.id.replace(from, to));
      doc.ref.update({ editedBy: userRef });
    }
  });
}

async function processAudit() {
  const audit = db.collection('audit');

  const documents = await audit.get().then(({ docs }) => docs);

  if (!documents.length) return;

  return Promise.all(
    documents.map((doc) => {
      const { user } = doc.data();

      if (!user) return;
      return doc.ref.update({
        user: user.replace(from, to),
      });
    })
  );
}
