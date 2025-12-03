'use client';
import {
  Facebook,
  Instagram,
  Linkedin,
  Lock,
  Mail,
  MapPin,
  Phone,
  Shield,
  Twitter,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Products',
      links: [
        { label: 'Sports Betting', href: '#' },
        { label: 'Casino Games', href: '#' },
        { label: 'Live Betting', href: '#' },
        { label: 'Virtual Sports', href: '#' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Press', href: '#' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', href: '#' },
        { label: 'Contact Us', href: '#' },
        { label: 'FAQ', href: '#' },
        { label: 'Live Chat', href: '#' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Terms & Conditions', href: '#' },
        { label: 'Privacy Policy', href: '#' },
        { label: 'Responsible Gaming', href: '#' },
        { label: 'Cookies Policy', href: '#' },
      ],
    },
  ];

  return (
    <footer className='bg-background text-foreground border-t border-border'>
      {/* Top Section - Newsletter */}
      <div className='border-b border-border'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8 items-center'>
            <div>
              <h3 className='text-xl sm:text-2xl font-bold mb-2'>
                Stay Updated
              </h3>
              <p className='text-muted-foreground'>
                Get the latest odds, bonuses, and betting tips delivered to your
                inbox.
              </p>
            </div>
            <div className='flex gap-2'>
              <Input
                type='email'
                placeholder='Enter your email'
                className='bg-background'
              />
              <Button className='bg-primary text-primary-foreground hover:bg-primary/90'>
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8'>
          {/* Brand Section */}
          <div className='lg:col-span-1'>
            <div className='mb-6'>
              <h2 className='text-2xl font-bold'>bestslot</h2>
              <p className='text-sm text-muted-foreground mt-1'>
                Your Premier Betting Platform
              </p>
            </div>
            <div className='flex gap-4'>
              <a
                href='/'
                className='text-muted-foreground hover:text-foreground transition-colors'
                aria-label='Facebook'
              >
                <Facebook size={20} />
              </a>
              <a
                href='/'
                className='text-muted-foreground hover:text-foreground transition-colors'
                aria-label='Twitter'
              >
                <Twitter size={20} />
              </a>
              <a
                href='/'
                className='text-muted-foreground hover:text-foreground transition-colors'
                aria-label='Instagram'
              >
                <Instagram size={20} />
              </a>
              <a
                href='/'
                className='text-muted-foreground hover:text-foreground transition-colors'
                aria-label='LinkedIn'
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className='font-semibold mb-4 text-sm uppercase tracking-wide'>
                {section.title}
              </h4>
              <ul className='space-y-3'>
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className='text-muted-foreground hover:text-foreground transition-colors text-sm'
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Contact & Trust Section */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 border-t border-border'>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8'>
          <div className='flex gap-3'>
            <Mail className='shrink-0 mt-1' size={20} />
            <div>
              <p className='text-muted-foreground text-sm'>Email</p>
              <p className='font-semibold'>support@bestslot.com</p>
            </div>
          </div>
          <div className='flex gap-3'>
            <Phone className='shrink-0 mt-1' size={20} />
            <div>
              <p className='text-muted-foreground text-sm'>Phone</p>
              <p className='font-semibold'>+1 (800) BESTSLOT</p>
            </div>
          </div>
          <div className='flex gap-3'>
            <MapPin className='shrink-0 mt-1' size={20} />
            <div>
              <p className='text-muted-foreground text-sm'>Address</p>
              <p className='font-semibold'>123 Betting Ave, NY 10001</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges & Bottom */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-border'>
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8'>
          <div className='flex items-center justify-center gap-2 text-muted-foreground text-sm'>
            <Shield size={18} />
            <span>Licensed & Regulated</span>
          </div>
          <div className='flex items-center justify-center gap-2 text-muted-foreground text-sm'>
            <Lock size={18} />
            <span>SSL Encrypted</span>
          </div>
          <div className='flex items-center justify-center gap-2 text-muted-foreground text-sm'>
            <Shield size={18} />
            <span>Fair Gaming</span>
          </div>
          <div className='flex items-center justify-center gap-2 text-muted-foreground text-sm'>
            <Lock size={18} />
            <span>Secure Payment</span>
          </div>
          <div className='flex items-center justify-center gap-2 text-muted-foreground text-sm'>
            <Shield size={18} />
            <span>Account Protection</span>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className='border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-4'>
          <p className='text-muted-foreground text-sm text-center sm:text-left'>
            © {currentYear} bestslot. All rights reserved. Gamble responsibly.
          </p>
          <div className='flex gap-6 text-sm'>
            <Link
              href='#'
              className='text-muted-foreground hover:text-foreground transition-colors'
            >
              Sitemap
            </Link>
            <Link
              href='#'
              className='text-muted-foreground hover:text-foreground transition-colors'
            >
              Accessibility
            </Link>
            <Link
              href='#'
              className='text-muted-foreground hover:text-foreground transition-colors'
            >
              Cookie Settings
            </Link>
          </div>
        </div>

        {/* Responsible Gaming */}
        <div className='mt-6 p-4 bg-accent rounded-lg border border-border'>
          <p className='text-muted-foreground text-xs leading-relaxed'>
            <span className='font-semibold'>Please Gamble Responsibly:</span>{' '}
            This site is intended for adult entertainment only. By using this
            site, you acknowledge that you are of legal age to gamble in your
            jurisdiction. If you feel you have a gambling problem, please visit{' '}
            <Link href='#' className='hover:underline text-primary'>
              GamCare
            </Link>{' '}
            or call the National Problem Gambling Helpline at 1-800-522-4700.
          </p>
        </div>
      </div>
    </footer>
  );
}
