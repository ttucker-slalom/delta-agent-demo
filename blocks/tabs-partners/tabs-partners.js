// eslint-disable-next-line import/no-unresolved
import { toClassName } from '../../scripts/aem.js';

// Optional icon per tab, keyed by the tab's derived id (toClassName of its label).
// When a tab has a matching entry, an icon is rendered above its label — mirroring
// the source's icon tabs. Tabs without a mapping simply render label-only, so the
// block stays reusable for any content.
const TAB_ICONS = {
  featured: '/content/images/tab-featured.png',
  lodging: '/content/images/tab-lodging.png',
  cars: '/content/images/tab-cars.png',
  specialty: '/content/images/tab-specialty.png',
  'shop-dine': '/content/images/tab-shop-dine.png',
};

export default async function decorate(block) {
  // build tablist
  const tablist = document.createElement('div');
  tablist.className = 'tabs-partners-list';
  tablist.setAttribute('role', 'tablist');

  // decorate tabs and tabpanels
  const tabs = [...block.children].map((child) => child.firstElementChild);
  tabs.forEach((tab, i) => {
    const id = toClassName(tab.textContent);

    // decorate tabpanel
    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-partners-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    // build tab button
    const button = document.createElement('button');
    button.className = 'tabs-partners-tab';
    button.id = `tab-${id}`;
    button.innerHTML = tab.innerHTML;

    // Prepend the source icon above the label when one is mapped for this tab.
    const iconSrc = TAB_ICONS[id];
    if (iconSrc) {
      const icon = document.createElement('img');
      icon.className = 'tabs-partners-icon';
      icon.src = iconSrc;
      icon.alt = '';
      icon.loading = 'lazy';
      button.prepend(icon);
    }

    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });
    tablist.append(button);
    tab.remove();
  });

  block.prepend(tablist);
}
