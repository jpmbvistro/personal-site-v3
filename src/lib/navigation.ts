export type NavigationItem = {
  label: string;
  href: string;
  cta?: boolean;
};

export const footerNavigationItems: NavigationItem[] = [
  { label: 'Contact', href: '/contact/' },
];

export function buildNavigation(hasArticles: boolean): NavigationItem[] {
  const items: NavigationItem[] = [
    { label: 'Case Studies', href: '/work/' },
    { label: 'Projects', href: '/projects/' },
  ];
  if (hasArticles) items.push({ label: 'Articles', href: '/articles/' });
  items.push({ label: 'About', href: '/about/' });
  items.push({ label: 'Work With Me', href: '/work-with-me/', cta: true });
  return items;
}

// Back-compat static export used by older callers; defaults to no Articles.
export const navigation: readonly NavigationItem[] = buildNavigation(false);
