export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-low py-space-xl shadow-[0_-1px_6px_rgba(0,0,0,0.02)]">
      <div className="max-w-[1320px] mx-auto px-margin-mobile lg:px-margin">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-lg pb-space-lg">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[18px]">emergency</span>
            <span className="font-headline-sm text-headline-sm text-on-surface">Campus Connect</span>
            <span className="font-caption text-caption text-on-surface-variant ml-space-sm italic">
              Collegiate Gazette &amp; Academic Assemblies
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-space-lg">
            <a href="#" className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors">
              Society Guidelines
            </a>
            <a href="#" className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors">
              Code of Conduct
            </a>
            <a href="#" className="inline-flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[16px]">rss_feed</span>
              <span>RSS Dispatches</span>
            </a>
          </div>
        </div>
        <div className="pt-space-md flex flex-col sm:flex-row items-center justify-between gap-space-sm border-t border-outline-variant/40">
          <p className="font-caption text-caption text-on-surface-variant">
            © 2026 Campus Connect Collegiate Publishing Guild. All university rights reserved.
          </p>
          <p className="font-caption text-caption text-tertiary">
            Archival cream edition · Printed for scholar community
          </p>
        </div>
      </div>
    </footer>
  )
}
