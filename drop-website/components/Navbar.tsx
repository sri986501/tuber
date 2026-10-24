"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Logo } from "./Logo";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/explore", label: "Explore" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Monitor scroll for subtle navbar elevation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Handle Escape key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-drop-navy/90 backdrop-blur-md border-b border-drop-cyan/15 shadow-lg shadow-drop-navy/80"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Logo size="md" />

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center gap-1 bg-drop-midnight/60 border border-drop-cyan/15 rounded-full px-4 py-1.5 backdrop-blur-sm"
            aria-label="Main Navigation"
          >
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors relative ${
                    isActive
                      ? "text-drop-white bg-drop-cyan/15 font-semibold"
                      : "text-drop-muted hover:text-drop-white hover:bg-drop-cyan/5"
                  } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-drop-cyan`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                  {isActive && (
                    <span
                      className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-drop-cyan"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* CTA Action button */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-drop-white bg-gradient-to-r from-drop-blue to-drop-violet hover:from-drop-cyan hover:to-drop-blue transition-all duration-300 shadow-md shadow-drop-blue/20 hover:shadow-drop-cyan/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-drop-cyan"
            >
              <span>Get in Touch</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden inline-flex items-center justify-center p-2.5 rounded-xl text-drop-muted hover:text-drop-white hover:bg-drop-midnight border border-drop-cyan/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-drop-cyan"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        id="mobile-menu"
        className={`md:hidden fixed inset-x-0 top-20 bottom-0 bg-drop-navy/98 backdrop-blur-xl border-t border-drop-cyan/20 transition-all duration-300 ease-in-out px-6 py-8 overflow-y-auto flex flex-col justify-between ${
          mobileMenuOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wider text-drop-cyan/80 font-semibold px-3 mb-2">
            Navigation
          </p>
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-medium transition-colors ${
                  isActive
                    ? "text-drop-white bg-drop-cyan/15 border border-drop-cyan/30"
                    : "text-drop-muted hover:text-drop-white hover:bg-drop-midnight"
                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-drop-cyan`}
                aria-current={isActive ? "page" : undefined}
              >
                <span>{link.label}</span>
                {isActive && <span className="w-2 h-2 rounded-full bg-drop-cyan" />}
              </Link>
            );
          })}
        </div>

        <div className="pt-6 border-t border-drop-cyan/15 space-y-4">
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-base font-semibold text-drop-white bg-gradient-to-r from-drop-blue to-drop-violet hover:from-drop-cyan hover:to-drop-blue shadow-lg shadow-drop-blue/25"
          >
            <span>Get in Touch</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
          <p className="text-center text-xs text-drop-muted">
            Small Steps. Big Ideas. • DROP Student Lab
          </p>
        </div>
      </div>
    </header>
  );
}
