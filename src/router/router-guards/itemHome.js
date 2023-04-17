import store from '@/store';
import writeLog from '@/db/Logger/Logger.js';
import getSlugRef from './routerGuardUtil';

const { state } = store;

/**
 * Router guard for organization, department, and product 'home' pages.
 */
export default async function itemHome(to, from, next) {
  const { activeItem } = state;
  const { slug } = to.params;

  if (from.params && from.params.slug === slug) next();
  if (activeItem && activeItem.slug === slug) next();

  try {
    const slugRef = await getSlugRef(slug);

    if (!activeItem || !slugRef || activeItem.id !== slugRef.id) {
      await store.dispatch('set_active_item', slugRef);
      // Log data
      writeLog(slug);
    }

    next();
  } catch ({ message }) {
    if (!state.user) {
      next({
        name: 'Login',
        query: { redirectFrom: to.fullPath },
      });
    } else {
      next({ name: 'Not found' });
    }
  }
}
