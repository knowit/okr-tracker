import { db } from '@/config/firebaseConfig';

const orgs = [];
const departments = [];
const products = [];
const objectives = [];
const periods = [];

const getData = async () => {
  await db
    .collection('organizations')
    .where('archived', '==', false)
    .get()
    .then(({ docs }) =>
      docs.forEach(doc => {
        const { name, missionStatement } = doc.data();
        orgs.push({
          ref: doc.ref.id,
          name,
          missionStatement,
          periods: [],
        });
      })
    );

  await db
    .collection('departments')
    .where('archived', '==', false)
    .get()
    .then(({ docs }) => {
      docs.forEach(async doc => {
        const { name, missionStatement, organization } = doc.data();

        departments.push({
          ref: doc.ref.id,
          name,
          missionStatement,
          organization: organization.id,
          periods: [],
        });
      });
    });

  await db
    .collection('products')
    .where('archived', '==', false)
    .get()
    .then(({ docs }) => {
      docs.forEach(async doc => {
        const { name, missionStatement, department } = doc.data();

        products.push({
          ref: doc.ref.id,
          name,
          missionStatement,
          department: department.id,
          periods: [],
        });
      });
    });

  await db
    .collection('objectives')
    .where('archived', '==', false)
    .get()
    .then(({ docs }) => {
      docs.forEach(doc => {
        const { name, description, period } = doc.data();

        objectives.push({
          ref: doc.ref.id,
          name,
          period: period.id,
          description,
        });
      });
    });

  await db
    .collection('periods')
    .where('archived', '==', false)
    .get()
    .then(({ docs }) => {
      const filteredDocs = docs.filter(filterPeriodsIncludeToday);

      filteredDocs.forEach(doc => {
        const { name, startDate, endDate, parent } = doc.data();

        periods.push({
          ref: doc.ref.id,
          name,
          startDate,
          endDate,
          parent: parent.id,
          objectives: [],
        });
      });
    });

  objectives.forEach(obj => {
    periods.forEach(period => {
      if (period.ref === obj.period) {
        period.objectives.push(obj);
      }
    });
  });

  periods.forEach(period => {
    departments.forEach(dep => {
      if (dep.ref === period.parent) {
        dep.periods.push(period);
      }
    });

    products.forEach(prod => {
      if (prod.ref === period.parent) {
        prod.periods.push(period);
      }
    });

    orgs.forEach(org => {
      if (org.ref === period.parent) {
        org.periods.push(period);
      }
    });
  });

  console.log(orgs);
  console.log(departments);
  console.log(products);
  console.log(periods);
  console.log(objectives);
};

const filterPeriodsIncludeToday = doc => {
  const now = new Date();
  const { startDate, endDate } = doc.data();
  if (startDate.toDate() > now) return false;
  if (endDate.toDate() < now) return false;
  return true;
};

export default getData;
