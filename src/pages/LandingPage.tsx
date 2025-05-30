import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  CheckCircle,
  TrendingUp,
  LineChart,
  Bell,
  Send,
} from "lucide-react";
import { toast } from "sonner";

const LandingPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the enquiry to a backend
    toast.success("Thank you for your message! We'll get back to you soon.");
    setEmail("");
    setMessage("");
  };

  const features = [
    {
      icon: <CheckCircle className="h-6 w-6 text-primary-500" />,
      title: "Habit Tracking",
      description:
        "Track your daily, weekly, or custom habits with an intuitive interface.",
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-primary-500" />,
      title: "Progress Analytics",
      description:
        "Visualize your progress with detailed charts and statistics.",
    },
    {
      icon: <Bell className="h-6 w-6 text-primary-500" />,
      title: "Smart Reminders",
      description: "Never miss a habit with customizable notifications.",
    },
    {
      icon: <LineChart className="h-6 w-6 text-primary-500" />,
      title: "Streak Tracking",
      description: "Build momentum by maintaining and tracking your streaks.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">
              HabitHub
            </span>
          </div>
          <button
            onClick={() => navigate("/auth")}
            className="rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16">
        <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Build Better Habits,</span>
              <span className="block text-primary-600">
                Transform Your Life
              </span>
            </h1>
            <p className="mx-auto mt-3 max-w-md text-base text-gray-500 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl">
              Track, analyze, and improve your daily habits with HabitHub. Our
              science-backed approach helps you build lasting habits and achieve
              your goals.
            </p>
            <div className="mx-auto mt-5 max-w-md sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <button
                  onClick={() => navigate("/auth")}
                  className="flex w-full items-center justify-center rounded-md bg-primary-600 px-8 py-3 text-base font-medium text-white hover:bg-primary-700 md:px-10 md:py-4 md:text-lg"
                >
                  Start Free
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mt-32 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to build better habits
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
              Our comprehensive features help you stay on track and achieve your
              goals.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="rounded-lg bg-white p-6 shadow-md transition-transform hover:scale-105"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-gray-500">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Habits Matter Section */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Why Habits Matter
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                Habits shape our daily lives and determine our long-term
                success. Research shows that:
              </p>
              <div className="mt-8 space-y-4">
                {[
                  "40% of our daily actions are habits, not conscious decisions",
                  "It takes an average of 66 days to form a new habit",
                  "Small habits compound into remarkable results over time",
                  "Good habits are the foundation of personal growth",
                ].map((item, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="mr-3 h-6 w-6 flex-shrink-0 text-primary-500" />
                    <p className="text-gray-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-12 lg:mt-0">
              <div className="space-y-4 rounded-lg bg-white p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900">
                  How HabitHub Helps
                </h3>
                <div className="space-y-4">
                  {[
                    "Simple and intuitive habit tracking",
                    "Data-driven insights and progress visualization",
                    "Customizable reminders and notifications",
                    "Community support and accountability",
                    "Science-backed habit formation strategies",
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-primary-500" />
                      <p className="text-gray-600">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-primary-600 px-6 py-16 sm:p-16">
            <div className="mx-auto max-w-xl lg:max-w-none">
              <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Get in Touch
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-100">
                  Have questions about HabitHub? We'd love to hear from you.
                </p>
              </div>
              <div className="mt-12">
                <form
                  onSubmit={handleEnquiry}
                  className="sm:flex sm:flex-col sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <label htmlFor="email" className="sr-only">
                      Email address
                    </label>
                    <input
                      type="email"
                      required
                      className="block w-full rounded-md border-0 px-4 py-3 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-300"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="mt-4 min-w-0 flex-1">
                    <label htmlFor="message" className="sr-only">
                      Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      className="block w-full rounded-md border-0 px-4 py-3 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-300"
                      placeholder="Your message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="mt-4 flex w-full items-center justify-center rounded-md bg-white px-4 py-3 text-base font-medium text-primary-600 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-300 sm:w-auto"
                  >
                    <Send className="mr-2 h-5 w-5" />
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-white" />
              <span className="ml-2 text-xl font-bold text-white">
                HabitHub
              </span>
            </div>
            <p className="text-base text-gray-400">
              &copy; {new Date().getFullYear()} HabitHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
