"use client";

import { motion } from "framer-motion";
import { 
  Calendar, 
  ShieldCheck, 
  Users, 
  BarChart3, 
  LayoutDashboard,
  CheckCircle2,
  ArrowRight,
  Menu,
  X
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      title: "Smart Booking System",
      description: "Prevent double-bookings with our real-time availability calendar and automated conflict detection.",
      icon: <Calendar className="w-6 h-6 text-blue-600" />,
    },
    {
      title: "Multi-Tenant Architecture",
      description: "Run multiple marquees independently under a single SaaS subscription with white-label support.",
      icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
    },
    {
      title: "Staff & Client Panels",
      description: "Separate portals for management, staff members, and customers to streamline communication.",
      icon: <Users className="w-6 h-6 text-blue-600" />,
    },
    {
      title: "Advanced Analytics",
      description: "Track revenue, occupancy rates, and popular packages with beautiful interactive charts.",
      icon: <BarChart3 className="w-6 h-6 text-blue-600" />,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center overflow-hidden">
              <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Lincoz <span className="text-blue-600">MMS</span></span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="hover:text-blue-600 transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</Link>
            <Link href="/login" className="font-semibold px-6 py-2 rounded-full border border-blue-600 text-blue-600 hover:bg-blue-50 transition-all">Login</Link>
            <Link href="/register" className="font-semibold px-6 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">Get Started</Link>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
              Manage Your Marquee Like a <span className="text-blue-600">Pro</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              The all-in-one SaaS platform for marriage halls, banquet venues, and marquees. 
              Streamline bookings, manage staff, and scale your event business.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link href="/login" className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center group">
                Login to Access <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="#features" className="px-8 py-4 bg-white border border-gray-200 rounded-xl font-bold text-lg hover:border-blue-600 transition-all flex items-center justify-center">
                View Features
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gray-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Core Management Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">Everything you need to run an efficient event venue in one place.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                whileHover={{ y: -10 }}
                className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">Simple, transparent pricing for marquees of all sizes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                name: "Monthly", 
                price: "3,000", 
                duration: "/mo",
                features: ["All Features Included", "7 Days Free Trial", "Standard Support", "Cloud Backup"] 
              },
              { 
                name: "6 Months", 
                price: "10,000", 
                duration: "/6mo",
                features: ["Save 8,000 PKR", "Priority Support", "Advanced Analytics", "Custom Branding"],
                popular: true 
              },
              { 
                name: "Yearly", 
                price: "20,000", 
                duration: "/yr",
                features: ["Save 16,000 PKR", "VIP Support", "Staff Training", "Multi-Hall Support"] 
              },
              { 
                name: "Lifetime", 
                price: "100,000", 
                duration: " once",
                features: ["Pay Once, Use Forever", "Free Lifetime Updates", "No Monthly Fees", "Dedicated Manager"] 
              }
            ].map((plan, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className={`p-8 rounded-[3rem] bg-white border ${plan.popular ? "border-blue-600 ring-4 ring-blue-50" : "border-gray-100"} relative overflow-hidden shadow-xl`}
              >
                {plan.popular && (
                  <div className="absolute top-6 -right-12 bg-blue-600 text-white px-12 py-1 rotate-45 text-[10px] font-bold uppercase">
                    Best Value
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-3xl font-black">Rs.{plan.price}</span>
                  <span className="text-gray-500 text-sm">{plan.duration}</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm font-medium text-gray-600">
                      <CheckCircle2 size={18} className="text-blue-600" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/login" className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center ${plan.popular ? "bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700" : "bg-gray-50 text-gray-900 hover:bg-gray-100"}`}>
                  Get Started
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats/Trust Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="opacity-80">Active Marquees</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1M+</div>
              <div className="opacity-80">Bookings Handled</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="opacity-80">Uptime Reliability</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="opacity-80">Support Response</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t mt-auto">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <LayoutDashboard className="text-blue-600 w-6 h-6" />
            <span className="text-xl font-bold">Lincoz MMS</span>
          </div>
          <p className="text-gray-500 mb-8">Premium Marquee Management System © 2026 Lincoz Tech.</p>
          <div className="flex justify-center space-x-6 text-gray-400">
            <Link href="#" className="hover:text-blue-600">Privacy Policy</Link>
            <Link href="#" className="hover:text-blue-600">Terms of Service</Link>
            <Link href="#" className="hover:text-blue-600">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
