import { db } from '@/config/firebaseConfig';
import { organization } from '../config/breadcrumbs';

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
      docs.forEach(doc => {
        const { name, startDate, endDate, parent } = doc.data();

        periods.push({
          ref: doc.ref.id,
          name,
          startDate,
          endDate,
          parent: parent.id,
        });
      });
    });

  objectives.forEach(obj => {
    periods.forEach(period => {
      period.objectives = [];
      if (period.id === obj.period.id) {
        period.objectives.push(obj);
      }
    });
  });

  periods.forEach(period => {
    departments.forEach(dep => {
      dep.periods = [];
      if (dep.id === period.parent.id) {
        dep.periods.push(period);
      }
    });

    products.forEach(prod => {
      prod.periods = [];
      if (prod.id === period.parent.id) {
        prod.periods.push(period);
      }
    });

    orgs.forEach(org => {
      org.periods = [];
      if (org.id === period.parent.id) {
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

export default getData;
