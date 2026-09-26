'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from './AuthProvider'

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/events', label: 'Events' },
  { href: '/registrations', label: 'My Registrations' },
  { href: '/organizer', label: 'Organizer' },
]

export default function Navbar() {
  const pathname = usePathname()
  const { currentUser, setCurrentUserId, allUsers } = useAuth()

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-canvas-cream/95 backdrop-blur-md border-b border-divider-hairline shadow-[0_1px_8px_rgba(45,35,30,0.04)]">
      <div className="h-20 max-w-7xl mx-auto px-gutter flex items-center justify-between gap-space-md">
        <Link href="/" className="flex items-center gap-space-md min-w-[280px]">
          <img alt="CampusConnect Blossom Sunburst Emblem" className="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMXCxcXS99ttksfheK3gSiJcynfo9FQPTxxYf305l1pUIEWYpuv_0_-bEOJnLtHU7EFc9wjcoTHKskFnFX8a9Fo8ik4aSaqOGOi7TFSGL6ali2hXdkbFsyVHIhS4y3Sozf5mHaPV3o-5cXwiGNMFy7PkANtRbdfyVuH7tfiDJlQTNtnBn_Tr2R2aGf-VQxJsbsASBx9tMPrmvYI4ZoPRr_3q49tmLLmGBjaq9zEA2tKPZEQ7wyZnuTKg" />
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-semibold">CampusConnect</span>
            <span className="font-editorial-italic text-meta-caps italic text-cocoa-sand tracking-normal">Vol. 24 · The Campus Chronicle &amp; Club Hub</span>
          </div>
        </Link>
        <nav className="hidden lg:flex items-center gap-space-sm">
          {LINKS.filter(
            (link) => link.href !== '/organizer' || currentUser.role === 'organizer',
          ).map((link) => {
            const active =
              link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all ${
                  active
                    ? 'bg-secondary-container text-primary font-semibold'
                    : 'text-on-surface-variant hover:bg-tertiary-fixed hover:text-on-surface'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
        <div className="flex items-center gap-space-md">
          <div className="hidden sm:flex items-center bg-surface-tint border border-divider-hairline rounded-full p-1 shadow-[0_2px_4px_rgba(45,35,30,0.03)]">
            {allUsers.map((user) => {
              const isActive = user.id === currentUser.id;
              return (
                <button
                  key={user.id}
                  onClick={() => setCurrentUserId(user.id)}
                  className={`px-space-sm py-0.5 rounded-full font-label-sm text-label-sm transition-colors ${
                    isActive
                      ? 'bg-surface-white text-primary border border-divider-hairline shadow-[0_1px_2px_rgba(45,35,30,0.04)]'
                      : 'text-cocoa-sand hover:text-primary'
                  }`}
                  type="button"
                >
                  {user.role === 'organizer' ? 'Organizer' : 'Student'} ({user.name.split(' ')[0]})
                </button>
              )
            })}
          </div>
          <button aria-label="Search campus archives" className="w-9 h-9 rounded-full bg-surface-tint border border-divider-hairline flex items-center justify-center text-primary hover:bg-secondary-container hover:text-primary transition-colors" type="button">
            <span className="material-symbols-outlined text-[18px]">search</span>
          </button>
          <button aria-label="Notifications" className="relative w-9 h-9 rounded-full bg-surface-tint border border-divider-hairline flex items-center justify-center text-primary hover:bg-secondary-container hover:text-primary transition-colors" type="button">
            <span className="material-symbols-outlined text-[18px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-apricot ring-2 ring-canvas-cream"></span>
          </button>
          <div className="flex items-center gap-space-xs pl-space-xs">
            <img alt="Profile" className="w-8 h-8 rounded-full object-cover border border-divider-hairline" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCj8dhoS4aZWlv7Cxv64rJZtJaPg5CHoX0-t_bFh1P8Do5qUBi6kHlAC2GcVSvDKQdVOkjde8jCLZfMQ-aFubKpSPBfVq44gbG4X-BdUO9YyA7H9Ucncyc64Ix23mFtkgiw8BsCI4wne8WXMiFilnirsy8SJE9dO0BWUTeIaWQX7Axsj3zmAgNmr5_CjUVsRK49LJEpLMExSNSLcL6GeghqPsd-CKjSSpqmyjDELs4fPgxwjT_wVaUP6w" />
          </div>
        </div>
      </div>
    </header>
  )
}
