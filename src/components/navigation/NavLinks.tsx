import { Link } from 'react-router-dom';

interface NavLink {
  href: string;
  label: string;
}

interface NavLinksProps {
  links: NavLink[];
  currentPath: string;
  className?: string;
}

export const NavLinks = ({ links, currentPath, className = '' }: NavLinksProps) => {
  return (
    <>
      {links.map((link) => {
        const isActive = link.href === '/' 
          ? currentPath === link.href
          : currentPath.startsWith(link.href);

        return (
          <Link
            key={link.href}
            to={link.href}
            className={`px-3 py-2 text-sm font-semibold rounded-full transition-colors ${
              isActive
                ? 'text-white bg-white/10'
                : 'text-white/70 hover:text-white hover:bg-white/8'
            } ${className}`}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
};
