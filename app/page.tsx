"use client";

import {
  Navbar,
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  TestimonialsSection,
  CTASection,
  FooterSection,
} from "./components";
import {
  Zap,
  Apple,
  Eye,
  TrendingUp,
  Smartphone,
  Brain,
  Target,
  CheckCircle,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
} from "lucide-react";
import {
  NavItem,
  Feature,
  Step,
  Testimonial,
  FooterLinkGroup,
  SocialLink,
} from "./types";

export default function HomePage() {
  // Navigation items
  const navItems: NavItem[] = [
    { label: "Features", href: "#features" },
    { label: "How it Works", href: "#how-it-works" },
    { label: "Testimonials", href: "#testimonials" },
  ];

  // Features data
  const features: Feature[] = [
    {
      icon: Zap,
      title: "Dynamic Training",
      description:
        "Auto-adjusting workout plans that adapt to every rep, recovery signal, and progress update.",
      iconColor: "text-blue-500",
    },
    {
      icon: Apple,
      title: "Precision Nutrition",
      description:
        "Custom meal guidance built from your macros, biometrics, and taste preferences.",
      iconColor: "text-green-500",
    },
    {
      icon: Eye,
      title: "Pose Coaching",
      description:
        "Real-time movement analysis to keep every rep safe, efficient, and effective.",
      iconColor: "text-purple-500",
    },
    {
      icon: TrendingUp,
      title: "Progress Intelligence",
      description:
        "Clear analytics, habit tracking, and actionable insights to keep you on track.",
      iconColor: "text-orange-500",
    },
  ];

  // How it works steps
  const steps: Step[] = [
    {
      stepNumber: 1,
      title: "Assessment",
      description: "Share your fitness goals, preferences, and biometrics",
      icon: Target,
    },
    {
      stepNumber: 2,
      title: "Personalize",
      description: "AI generates customized workout and nutrition plans",
      icon: Brain,
    },
    {
      stepNumber: 3,
      title: "Execute",
      description: "Follow real-time coaching with form feedback",
      icon: Smartphone,
    },
    {
      stepNumber: 4,
      title: "Improve",
      description: "Track progress and get AI-driven adjustments",
      icon: CheckCircle,
    },
  ];

  // Testimonials data
  const testimonials: Testimonial[] = [
    {
      id: "1",
      quote:
        "NeuraFiT transformed my fitness journey. The AI coaching helped me fix my form and the adaptive workouts kept me challenged.",
      author: "Sarah Johnson",
      role: "Fitness Enthusiast",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&q=80",
      rating: 5,
    },
    {
      id: "2",
      quote:
        "The nutrition planning feature is incredible. It adjusted my meal plans based on my progress—exactly what I needed.",
      author: "Mike Chen",
      role: "Professional Athlete",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&q=80",
      rating: 5,
    },
    {
      id: "3",
      quote:
        "Best fitness app I've used. The real-time pose feedback prevents injuries and the analytics dashboard keeps me motivated.",
      author: "Emma Rodriguez",
      role: "Personal Trainer",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face&q=80",
      rating: 5,
    },
  ];

  // Footer links
  const footerLinkGroups: FooterLinkGroup[] = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "Security", href: "#security" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Blog", href: "/blog" },
        { label: "Careers", href: "/careers" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
        { label: "Contact", href: "/contact" },
      ],
    },
  ];

  // Social links
  const socialLinks: SocialLink[] = [
    { platform: "Facebook", href: "https://facebook.com", icon: Facebook },
    { platform: "Twitter", href: "https://twitter.com", icon: Twitter },
    { platform: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
    { platform: "Instagram", href: "https://instagram.com", icon: Instagram },
  ];

  return (
    <main className="w-full overflow-hidden">
      <Navbar
        logoText="NeuraFiT"
        navItems={navItems}
        ctaText="Get Started"
        ctaLink="/signup"
      />

      <HeroSection
        headline="Personalize your workouts, nutrition, and recovery with NeuraFiT"
        tagline="AI-Powered Fitness Platform"
        ctaText="Start free assessment"
        ctaLink="/assessment"
        secondaryCtaText="Explore platform features"
        secondaryCtaLink="#features"
        heroImage="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=800&fit=crop&q=80"
        heroImageAlt="NeuraFiT Dashboard"
      />

      <FeaturesSection
        title="Intelligent Fitness at Your Fingertips"
        subtitle="Harness the power of AI to optimize every aspect of your fitness journey"
        features={features}
      />

      <HowItWorksSection
        title="How NeuraFiT Works"
        subtitle="Get personalized AI coaching in just four simple steps"
        steps={steps}
      />

      <TestimonialsSection
        title="Trusted by Fitness Enthusiasts"
        subtitle="See how NeuraFiT has transformed real users' fitness journeys"
        testimonials={testimonials}
      />

      <CTASection
        headline="Ready to Transform Your Fitness?"
        description="Join thousands of users who are already achieving their goals with AI-powered personalization."
        primaryCtaText="Start Free Assessment"
        primaryCtaLink="/assessment"
        secondaryCtaText="Schedule Demo"
        secondaryCtaLink="/demo"
      />

      <FooterSection
        logoText="NeuraFiT"
        tagline="AI-powered fitness platform that personalizes your workouts, nutrition, and recovery journey."
        linkGroups={footerLinkGroups}
        socialLinks={socialLinks}
        copyrightText="© 2026 NeuraFiT. All rights reserved."
      />
    </main>
  );
}
