import { Github, Twitter, Linkedin } from 'lucide-react'
import { Link } from '@tanstack/react-router'

const links = {
  product: [
    { label: 'Features', href: '/' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Changelog', href: '#changelog' },
    { label: 'Roadmap', href: '#roadmap' },
  ],
  company: [
    { label: 'About', href: '#about' },
    { label: 'Blog', href: '#blog' },
    { label: 'Careers', href: '#careers' },
  ],
  legal: [
    { label: 'Privacy', href: '#privacy' },
    { label: 'Terms', href: '#terms' },
    { label: 'Security', href: '#security' },
  ],
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="page-wrap">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center bg-[var(--color-accent)] text-white text-sm font-semibold rounded-md">
                C
              </div>
              <span className="text-sm font-semibold">Callmind</span>
            </Link>
            <p className="text-sm text-[var(--color-text-muted)] max-w-xs">
              AI-powered sales coaching. Help your team close more deals.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold text-[var(--color-text-dim)] mb-4 uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-3">
              {links.product.map((link) => (
                <li key={link.label}>
                  <Link to={link.href as any} className="footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold text-[var(--color-text-dim)] mb-4 uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-3">
              {links.company.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="footer-link">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold text-[var(--color-text-dim)] mb-4 uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-3">
              {links.legal.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="footer-link">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-[var(--color-border-subtle)] gap-4">
          <p className="text-xs text-[var(--color-text-dim)]">
            © {new Date().getFullYear()} Callmind. All rights reserved.
          </p>

          {/* Social */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-text-dim)] hover:text-[var(--color-accent)] transition-colors"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-text-dim)] hover:text-[var(--color-accent)] transition-colors"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-text-dim)] hover:text-[var(--color-accent)] transition-colors"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
