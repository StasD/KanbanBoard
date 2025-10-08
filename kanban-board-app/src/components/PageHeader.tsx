import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Link,
  Button,
} from '@heroui/react';
import { getNavbarItems } from '@/lib/routeTree';

const AcmeLogo = () => {
  return (
    <svg fill="none" height="36" viewBox="0 0 32 32" width="36">
      <path
        clipRule="evenodd"
        d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};

const navbarItems = getNavbarItems();

function PageHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const currentLocation = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [currentLocation.pathname]);

  return (
    <Navbar
      shouldHideOnScroll
      isBordered
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      maxWidth="full"
      classNames={{ wrapper: 'max-w-7xl' }}
    >
      <NavbarContent>
        <NavbarMenuToggle aria-label={isMenuOpen ? 'Close menu' : 'Open menu'} className="sm:hidden" />
        <NavbarBrand>
          <AcmeLogo />
          <p className="font-bold text-inherit">KANBAN BOARD DEMO</p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {navbarItems.map((o, index) => {
          const isActive = currentLocation.pathname.startsWith(o.path);
          return (
            <NavbarItem key={index} isActive={isActive || undefined} aria-current={isActive ? 'page' : undefined}>
              <Link color={isActive ? 'foreground' : undefined} href={o.path}>
                {o.name}
              </Link>
            </NavbarItem>
          );
        })}
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem className="hidden lg:flex">
          <Link href="#">Login</Link>
        </NavbarItem>
        <NavbarItem>
          <Button as={Link} color="primary" href="#" variant="flat">
            Sign Up
          </Button>
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu>
        {navbarItems.map((o, index) => {
          const isActive = currentLocation.pathname.startsWith(o.path);
          return (
            <NavbarMenuItem key={index}>
              <Link className="w-full" color={isActive ? 'primary' : 'foreground'} href={o.path} size="lg">
                {o.name}
              </Link>
            </NavbarMenuItem>
          );
        })}
      </NavbarMenu>
    </Navbar>
  );
}

export default PageHeader;
