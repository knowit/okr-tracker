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
          departments: [],
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
          products: [],
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
      docs.forEach(doc => {
        const { name, startDate, endDate, parent } = doc.data();

        periods.push({
          ref: doc.ref.id,
          name,
          startDate: startDate.toDate(),
          endDate: endDate.toDate(),
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

  departments.forEach(dep => {
    const p = dep.periods.sort((a, b) => {
      return b.startDate - a.startDate;
    });
    const test = p.filter(filterPeriodsIncludeToday);
    const newPeriod = test[0] && test[0].ref ? test[0] : null;
    dep.periods = newPeriod || p[0];

    orgs.forEach(org => {
      if (org.ref === dep.parent) {
        org.departments.push(dep);
      }
    });
  });

  orgs.forEach(org => {
    const p = org.periods.sort((a, b) => {
      return b.startDate - a.startDate;
    });
    const test = p.filter(filterPeriodsIncludeToday);
    const newPeriod = test[0] && test[0].ref ? test[0] : null;
    org.periods = newPeriod || p[0];
  });

  products.forEach(prod => {
    const p = prod.periods.sort((a, b) => {
      return b.startDate - a.startDate;
    });
    const test = p.filter(filterPeriodsIncludeToday);
    const newPeriod = test[0] && test[0].ref ? test[0] : null;
    prod.periods = newPeriod || p[0];

    departments.forEach(dep => {
      if (dep.ref === prod.parent) {
        dep.products.push(prod);
      }
    });
  });

  console.log(orgs);
  console.log(departments);
  console.log(products);
};

const filterPeriodsIncludeToday = doc => {
  const now = new Date();
  const { startDate, endDate } = doc;
  if (startDate > now) return false;
  if (endDate < now) return false;
  return true;
};

export default getData;
