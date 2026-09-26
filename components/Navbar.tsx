'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from './AuthProvider'

const NAV_LINKS = [
  { href: '/events', label: 'Events', path: 'events' },
  { href: '/registrations', label: 'My Registrations', path: 'my-registrations' },
]

export default function Navbar() {
  const pathname = usePathname()
  const { currentUser, setCurrentUserId, allUsers } = useAuth()

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-20 max-w-[1320px] mx-auto px-margin-mobile lg:px-margin flex items-center justify-between gap-space-lg">
        {/* Logo + Nav */}
        <div className="flex items-center gap-space-xl">
          <Link href="/" className="flex items-center gap-space-xs group">
            <span className="material-symbols-outlined text-primary text-[22px] transition-transform duration-200 group-hover:rotate-45">
              emergency
            </span>
            <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface">
              Campus Connect
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-space-lg">
            {NAV_LINKS.filter(link =>
              link.href !== '/organizer' || currentUser.role === 'organizer'
            ).map(link => {
              const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
              return active ? (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current="page"
                  className="transition-colors text-primary font-title-md text-title-md border-b-2 border-primary pb-0.5"
                >
                  {link.label}
                </Link>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  {link.label}
                </Link>
              )
            })}
            <Link
              href="/events"
              className={`font-label-md text-label-md ${pathname.startsWith('/events') ? 'hidden' : ''} text-on-surface-variant hover:text-on-surface transition-colors`}
            >
              Collegiate Series
            </Link>
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-space-md">
          {currentUser.role === 'organizer' && (
            <Link
              href="/organizer"
              className="hidden sm:inline-flex items-center px-space-md py-space-xs rounded-full bg-secondary text-on-secondary font-label-md text-label-md hover:bg-secondary/90 transition-colors shadow-[0_1px_2px_rgba(35,32,29,0.03)]"
            >
              Organizer Portal
            </Link>
          )}

          {/* Role Switcher */}
          <div className="relative inline-flex items-center bg-surface-container-low px-space-sm py-space-xs rounded-lg shadow-[0_1px_2px_rgba(35,32,29,0.03)]">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mr-space-xs pl-space-xs">
              Role
            </span>
            <select
              aria-label="Role Switcher"
              value={currentUser.id}
              onChange={(e) => setCurrentUserId(e.target.value)}
              className="appearance-none bg-transparent font-label-md text-label-md text-on-surface pr-6 pl-space-xs py-space-xs focus:outline-none cursor-pointer"
            >
              {allUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role === 'organizer' ? 'Organizer' : 'Student'})
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined text-on-surface-variant text-[16px] pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
              arrow_drop_down
            </span>
          </div>

          {/* Notifications */}
          <button
            aria-label="Notifications"
            type="button"
            className="relative p-space-sm rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
          </button>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  )
}
