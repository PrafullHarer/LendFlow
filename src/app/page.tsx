'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './home.css';

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) setIsLoggedIn(true);
      })
      .catch(() => {});

    fetch('/api/feedback')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setFeedbacks(data);
      })
      .catch(() => {});
  }, []);

  const handleCTA = () => {
    router.push(isLoggedIn ? '/dashboard' : '/login');
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'Is LendFlow really free?',
      a: 'Yes, completely free. No credit card, no trial period, no hidden fees. LendFlow is a passion project built to solve a real problem for everyday lenders.',
    },
    {
      q: 'How is my data kept private?',
      a: "LendFlow uses Google Sign-In to authenticate you. Your data is stored isolated to your account — no one else, including other LendFlow users, can see your borrowers or payment records.",
    },
    {
      q: 'What type of interest does LendFlow calculate?',
      a: 'LendFlow calculates simple monthly interest. You enter the principal, annual or monthly rate, and loan duration. It generates a full repayment schedule with monthly interest installments and a final principal repayment.',
    },
    {
      q: 'Can I use LendFlow on my phone?',
      a: "Yes. LendFlow is fully responsive and works on mobile, tablet, and desktop. Since it's a web app, you don't need to download anything — just open your browser and sign in.",
    },
    {
      q: 'What happens when a loan is fully repaid?',
      a: 'When you mark the final payment as received, the loan automatically closes. It moves to your "Closed Loans" section and all activity is preserved in your audit log for future reference.',
    },
  ];

  return (
    <div className="home-page">
      {/* NAV */}
      <nav className="home-nav">
        <div className="home-nav-logo">
          <div className="home-nav-logo-icon">💸</div>
          <span className="home-nav-logo-text">LendFlow</span>
        </div>
        <div className="home-nav-links">
          <a onClick={() => scrollTo('how')}>How it Works</a>
          <a onClick={() => scrollTo('features')}>Features</a>
          <a onClick={() => scrollTo('faq')}>FAQ</a>
          <Link href="/feedback">Feedback</Link>
        </div>
        <button onClick={handleCTA} className="home-btn-primary">
          {isLoggedIn ? 'Dashboard →' : 'Get Started →'}
        </button>
      </nav>

      {/* BG */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div className="home-bg-blob" style={{ width: 600, height: 600, background: '#A3E635', top: -200, right: -200 }} />
        <div className="home-bg-blob" style={{ width: 400, height: 400, background: '#38BDF8', bottom: -150, left: -150, opacity: 0.10 }} />
        <div className="home-dot-grid" />
      </div>

      {/* HERO */}
      <section className="home-hero" style={{ position: 'relative', zIndex: 1 }}>
        <div className="home-badge">
          <span className="home-badge-dot" /> Smart Loan Management for India
        </div>
        <h1>
          Track Every Rupee.<br />
          <span className="highlight">Earn With Clarity.</span>
        </h1>
        <p className="home-hero-sub">
          LendFlow is your personal money-lending command center. Add borrowers, auto-calculate interest,
          track payments every month — and close loans when they&apos;re done. Built for real lenders, not accountants.
        </p>
        <div className="home-hero-btns">
          <button onClick={handleCTA} className="home-btn-primary home-btn-lg">
            {isLoggedIn ? 'Go to Dashboard →' : 'Start for Free →'}
          </button>
          <button className="home-btn-ghost" onClick={() => scrollTo('how')}>
            See How it Works ↓
          </button>
        </div>

        <div className="home-trust-bar" style={{ marginTop: 28 }}>
          <div className="home-trust-item"><span className="home-trust-icon">🔒</span> Your data, only yours</div>
          <div className="home-trust-item"><span className="home-trust-icon">⚡</span> Takes 2 mins to set up</div>
          <div className="home-trust-item"><span className="home-trust-icon">🆓</span> 100% free, no credit card</div>
          <div className="home-trust-item"><span className="home-trust-icon">📱</span> Works on all devices</div>
        </div>

        {/* MOCK DASHBOARD */}
        <div className="home-hero-preview">
          <div className="home-preview-bar">
            <div className="home-preview-dot red" />
            <div className="home-preview-dot yellow" />
            <div className="home-preview-dot green" />
            <span className="home-preview-title">LendFlow Dashboard — April 2025</span>
          </div>
          <div className="home-preview-body">
            <div className="home-mini-card">
              <div className="label">Total Lent</div>
              <div className="value" style={{ color: '#1B4332' }}>₹4,20,000</div>
              <div className="sub">Across 6 borrowers</div>
            </div>
            <div className="home-mini-card">
              <div className="label">Interest Earned</div>
              <div className="value" style={{ color: '#A3E635' }}>₹18,400</div>
              <div className="sub">This month</div>
            </div>
            <div className="home-mini-card">
              <div className="label">Due This Week</div>
              <div className="value" style={{ color: '#F59E0B' }}>₹12,000</div>
              <div className="sub">3 payments pending</div>
            </div>
            <div className="home-mini-card">
              <div className="label">Loans Closed</div>
              <div className="value">4</div>
              <div className="sub">Fully repaid ✓</div>
            </div>
          </div>
          <div className="home-preview-loans">
            <div className="home-loan-row">
              <div>
                <div className="home-loan-name">Rajesh Kumar</div>
                <div className="home-loan-amt">₹80,000 @ 2% / mo · 12 months</div>
              </div>
              <span className="home-loan-badge active">Active</span>
            </div>
            <div className="home-loan-row">
              <div>
                <div className="home-loan-name">Sunita Mehta</div>
                <div className="home-loan-amt">₹1,50,000 @ 1.5% / mo · 18 months</div>
              </div>
              <span className="home-loan-badge due">Due Today</span>
            </div>
            <div className="home-loan-row">
              <div>
                <div className="home-loan-name">Amit Sharma</div>
                <div className="home-loan-amt">₹50,000 @ 2.5% / mo · 6 months</div>
              </div>
              <span className="home-loan-badge closed">Closed</span>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="home-stats-section" style={{ position: 'relative', zIndex: 1 }}>
        <div className="home-stats-grid">
          <div className="home-stat-card">
            <div className="home-stat-value">₹0</div>
            <div className="home-stat-label">Cost to You</div>
          </div>
          <div className="home-stat-card">
            <div className="home-stat-value">Auto</div>
            <div className="home-stat-label">Interest Calc</div>
          </div>
          <div className="home-stat-card">
            <div className="home-stat-value">Real-Time</div>
            <div className="home-stat-label">Live Dashboard</div>
          </div>
          <div className="home-stat-card">
            <div className="home-stat-value">100%</div>
            <div className="home-stat-label">Private Data</div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="home-how-section" style={{ position: 'relative', zIndex: 1 }}>
        <div className="home-section-header">
          <div className="home-section-eyebrow">How it Works</div>
          <h2 className="home-section-title">Up and Running in 3 Steps</h2>
          <p className="home-section-sub">No training required. No accountant needed. Just sign in and start tracking.</p>
        </div>
        <div className="home-steps">
          <div className="home-step-card">
            <div className="home-step-num">STEP 01</div>
            <div className="home-step-icon" style={{ background: '#A3E635' }}>👤</div>
            <div className="home-step-title">Add a Borrower</div>
            <p className="home-step-desc">Enter the borrower&apos;s name, phone, principal amount, interest rate, and loan duration. LendFlow stores everything securely under your account.</p>
          </div>
          <div className="home-step-card">
            <div className="home-step-num">STEP 02</div>
            <div className="home-step-icon" style={{ background: '#38BDF8' }}>📅</div>
            <div className="home-step-title">Get a Payment Schedule</div>
            <p className="home-step-desc">A full repayment schedule is auto-generated — monthly interest payments, and the final lump-sum principal. No manual calculation ever.</p>
          </div>
          <div className="home-step-card">
            <div className="home-step-num">STEP 03</div>
            <div className="home-step-icon" style={{ background: '#34D399' }}>✅</div>
            <div className="home-step-title">Mark &amp; Track Payments</div>
            <p className="home-step-desc">Tap once to mark a payment received. Watch your dashboard update instantly. Loans auto-close when fully repaid — zero bookkeeping needed.</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="home-features-section" style={{ position: 'relative', zIndex: 1 }}>
        <div className="home-section-header">
          <div className="home-section-eyebrow">Features</div>
          <h2 className="home-section-title">Everything You Need, Nothing You Don&apos;t</h2>
          <p className="home-section-sub">Built specifically for private money lenders who want a powerful system without the complexity.</p>
        </div>
        <div className="home-features-grid">
          {[
            { icon: '👥', title: 'Borrower Profiles', desc: 'Store borrower name, phone, principal, interest rate, and loan duration in one place. Edit or close any time. Searchable and organized.', tag: 'Core', color: '#A3E635' },
            { icon: '📊', title: 'Live Dashboard', desc: 'See total capital lent, interest earned this month, upcoming due payments, and active vs. closed loans — all in one glance. Refreshes instantly.', tag: 'Real-Time', color: '#38BDF8' },
            { icon: '⚙️', title: 'Auto Interest Calc', desc: 'Enter principal + rate + duration. LendFlow auto-generates every monthly payment and the final lump-sum. Simple interest, no formulas needed.', tag: 'Automated', color: '#F472B6' },
            { icon: '✅', title: 'One-Tap Payments', desc: 'Mark individual payments as received with one tap. Loans automatically close when the final payment is marked. Full history always preserved.', tag: 'Easy', color: '#34D399' },
            { icon: '🔐', title: 'Private by Default', desc: 'Each Google account gets its own isolated data. No one — not even other LendFlow users — can see your borrowers, loans, or payment history.', tag: 'Secure', color: '#A78BFA' },
            { icon: '📋', title: 'Full Activity Log', desc: 'Every action is timestamped — new borrowers, payments received, loans closed. A clear audit trail so you always know what happened and when.', tag: 'Audit Trail', color: '#FBBF24' },
          ].map((f, i) => (
            <div key={i} className="home-feature-card">
              <div className="home-feature-icon" style={{ background: f.color }}>{f.icon}</div>
              <div className="home-feature-title">{f.title}</div>
              <p className="home-feature-desc">{f.desc}</p>
              <span className="home-feature-tag" style={{ background: f.color }}>{f.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* COMPARISON */}
      <section className="home-comparison-section" style={{ position: 'relative', zIndex: 1 }}>
        <div className="home-section-header">
          <div className="home-section-eyebrow">Why LendFlow</div>
          <h2 className="home-section-title">Notebooks vs. LendFlow</h2>
          <p className="home-section-sub">Most lenders juggle paper, WhatsApp, and spreadsheets. Here&apos;s what that really costs.</p>
        </div>
        <div className="home-compare-wrap">
          <div className="home-compare-card">
            <div className="home-compare-header bad">❌ The Old Way</div>
            <div className="home-compare-body">
              <div className="home-compare-item"><span className="icon">📓</span>Paper notebooks that get lost or damaged</div>
              <div className="home-compare-item"><span className="icon">🧮</span>Manual interest calculations prone to error</div>
              <div className="home-compare-item"><span className="icon">📲</span>WhatsApp reminders to track who paid</div>
              <div className="home-compare-item"><span className="icon">😰</span>No clear picture of total earnings at any time</div>
              <div className="home-compare-item"><span className="icon">🗂️</span>Spreadsheets that break and get out of sync</div>
              <div className="home-compare-item"><span className="icon">😤</span>Hours wasted every month reconciling records</div>
            </div>
          </div>
          <div className="home-compare-card">
            <div className="home-compare-header good">✅ With LendFlow</div>
            <div className="home-compare-body">
              <div className="home-compare-item"><span className="icon">☁️</span>All data safe in the cloud, always accessible</div>
              <div className="home-compare-item"><span className="icon">⚡</span>Instant auto-calculations, zero errors</div>
              <div className="home-compare-item"><span className="icon">📊</span>Real-time dashboard shows exactly who paid</div>
              <div className="home-compare-item"><span className="icon">💰</span>Total earnings visible at a glance, any time</div>
              <div className="home-compare-item"><span className="icon">🔄</span>Schedules auto-update when payments are marked</div>
              <div className="home-compare-item"><span className="icon">😌</span>Full month reconciliation done in seconds</div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="home-testimonials-section" style={{ position: 'relative', zIndex: 1 }}>
        <div className="home-section-header">
          <div className="home-section-eyebrow">Trusted By Lenders</div>
          <h2 className="home-section-title">What Our Users Say</h2>
          <p className="home-section-sub">Real feedback from people who manage private loans every day.</p>
        </div>
        
        {feedbacks.length > 0 ? (
          <div className="home-feedback-marquee">
            <div className="home-marquee-track">
              {/* Duplicate array for seamless infinite scroll */}
              {[...feedbacks, ...feedbacks].map((t, i) => (
                <div key={i} className="home-testimonial-card">
                  <div className="home-t-stars">⭐⭐⭐⭐⭐</div>
                  <p className="home-t-quote">"{t.message}"</p>
                  <div className="home-t-author">
                    <div className="home-t-avatar" style={{ background: ['#A3E635', '#38BDF8', '#F472B6', '#FEBC2E'][i % 4] }}>
                      {t.name ? t.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                      <div className="home-t-name">{t.name}</div>
                      <div className="home-t-role">Verified User</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="home-feedback-marquee">
            <div className="home-marquee-track">
              {[
                { quote: 'I used to maintain three notebooks for different borrowers. Now everything is in one place and I can see exactly how much I\'ve earned this month in seconds.', name: 'Ramesh P.', role: 'Private lender, Pune', initial: 'R', color: '#A3E635' },
                { quote: 'The auto-payment schedule alone saves me 2 hours a month. I never have to calculate interest manually anymore. My borrowers trust me more too.', name: 'Sunita M.', role: 'Family lender, Mumbai', initial: 'S', color: '#38BDF8' },
                { quote: 'I lend to 12 people. Before LendFlow, I was always confused about who paid and who didn\'t. Now I check the dashboard once a week — done.', name: 'Anil K.', role: 'Business lender, Hyderabad', initial: 'A', color: '#F472B6' },
                { quote: 'I used to maintain three notebooks for different borrowers. Now everything is in one place and I can see exactly how much I\'ve earned this month in seconds.', name: 'Ramesh P.', role: 'Private lender, Pune', initial: 'R', color: '#A3E635' },
                { quote: 'The auto-payment schedule alone saves me 2 hours a month. I never have to calculate interest manually anymore. My borrowers trust me more too.', name: 'Sunita M.', role: 'Family lender, Mumbai', initial: 'S', color: '#38BDF8' },
                { quote: 'I lend to 12 people. Before LendFlow, I was always confused about who paid and who didn\'t. Now I check the dashboard once a week — done.', name: 'Anil K.', role: 'Business lender, Hyderabad', initial: 'A', color: '#F472B6' },
              ].map((t, i) => (
                <div key={i} className="home-testimonial-card">
                  <div className="home-t-stars">⭐⭐⭐⭐⭐</div>
                  <p className="home-t-quote">"{t.quote}"</p>
                  <div className="home-t-author">
                    <div className="home-t-avatar" style={{ background: t.color }}>{t.initial}</div>
                    <div>
                      <div className="home-t-name">{t.name}</div>
                      <div className="home-t-role">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* FAQ */}
      <section id="faq" className="home-faq-section" style={{ position: 'relative', zIndex: 1 }}>
        <div className="home-section-header">
          <div className="home-section-eyebrow">FAQ</div>
          <h2 className="home-section-title">Common Questions</h2>
          <p className="home-section-sub">Everything you need to know before getting started.</p>
        </div>
        <div className="home-faq-wrap">
          {faqs.map((faq, i) => (
            <div key={i} className={`home-faq-item ${openFaq === i ? 'open' : ''}`} onClick={() => toggleFaq(i)}>
              <div className="home-faq-q">
                {faq.q}
                <span className="home-faq-arrow">▾</span>
              </div>
              <div className="home-faq-a">{faq.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="home-cta-section" style={{ position: 'relative', zIndex: 1 }}>
        <div className="home-cta-box">
          <div className="home-cta-glow" />
          <h2>Ready to Take Control?</h2>
          <p>Stop juggling notebooks, WhatsApp reminders, and broken spreadsheets. LendFlow organizes your entire lending operation in under 5 minutes.</p>
          <div className="home-cta-perks">
            <div className="home-cta-perk"><span className="home-cta-perk-dot" /> Free forever</div>
            <div className="home-cta-perk"><span className="home-cta-perk-dot" /> No spreadsheets</div>
            <div className="home-cta-perk"><span className="home-cta-perk-dot" /> Auto interest calc</div>
            <div className="home-cta-perk"><span className="home-cta-perk-dot" /> 100% private</div>
          </div>
          <button onClick={handleCTA} className="home-btn-primary home-btn-lg" style={{ position: 'relative' }}>
            {isLoggedIn ? 'Open Dashboard →' : 'Sign Up Free →'}
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="home-footer" style={{ position: 'relative', zIndex: 1 }}>
        <div className="home-footer-inner">
          <div className="home-nav-logo">
            <div className="home-nav-logo-icon" style={{ width: 32, height: 32, fontSize: 15 }}>💸</div>
            <span className="home-nav-logo-text" style={{ fontSize: 15 }}>LendFlow</span>
          </div>
          <p className="home-footer-copy">Created by Prafull Harer · © {new Date().getFullYear()}</p>
          <div className="home-footer-links">
            <a onClick={() => scrollTo('how')}>How it Works</a>
            <a onClick={() => scrollTo('features')}>Features</a>
            <a onClick={() => scrollTo('faq')}>FAQ</a>
            <Link href="/feedback">Feedback</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
