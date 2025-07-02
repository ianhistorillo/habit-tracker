import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  CheckCircle,
  TrendingUp,
  LineChart,
  Bell,
  Send,
  Brain,
  Target,
  Calendar,
  Zap,
  Users,
  Shield,
  Smartphone,
  BarChart3,
  Star,
  ArrowRight,
  Play,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const LandingPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-enquiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: email.trim(),
          message: message.trim(),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Thank you for your message! We'll get back to you soon.");
        setEmail("");
        setMessage("");
      } else {
        toast.error(result.error || "Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error('Error sending enquiry:', error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rotate through features for the AI Coach section
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeatureIndex((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Brain className="h-8 w-8 text-primary-500" />,
      title: "AI-Powered Insights",
      description: "Get personalized habit recommendations and insights powered by advanced AI algorithms.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Target className="h-8 w-8 text-primary-500" />,
      title: "Smart Goal Setting",
      description: "Set intelligent goals with our science-backed approach to habit formation and tracking.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-primary-500" />,
      title: "Advanced Analytics",
      description: "Visualize your progress with beautiful charts, streaks, and detailed performance metrics.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <Zap className="h-8 w-8 text-primary-500" />,
      title: "Routine Builder",
      description: "Create powerful morning and evening routines with our intelligent routine builder.",
      gradient: "from-orange-500 to-red-500"
    },
  ];

  const stats = [
    { number: "Limited Offer", label: "Free access to all features" },
    { number: "Guide Assistant", label: "Will help you get started" },
    { number: "AI Powered", label: "Have struggles? Ask our AI Coach" },
    { number: "24/7", label: "Available Support" }, 
  ];

  const testimonials = [
    {
      name: "From Medium User",
      role: "Writer",
      content: "Switching to an app meant I averaged a 49% completion rate… The app I use makes a happy chiming noise… I love those little gold stars.",
    },
    {
      name: "From Reddit r/productivity",
      role: "Reddit User",
      content: "One user shared tracking 15 daily habits using Notion, including reading, yoga, guitar practice, and more—discovering that “it is really hard to do things daily if they are not part of your identity.",
    },
    {
      name: "From Life Planner Blog",
      role: "Blog Post",
      content: "Sarah (busy mom): habit tracking gave her “accountability and visual reminders,” helping her stick to workouts and build a sustainable routine ",
    },
  ];

  const aiCoachFeatures = [
    { icon: <Brain />, title: "Personalized AI Insights", description: "Get tailored advice based on your goals and lifestyle" },
    { icon: <Target />, title: "Smart Goal Setting", description: "Set achievable goals with science-backed strategies" },
    { icon: <MessageCircle />, title: "24/7 Chat Support", description: "Ask questions anytime and get instant guidance" },
    { icon: <TrendingUp />, title: "Progress Optimization", description: "Continuous improvement suggestions based on your data" }
  ];

  const coachingBenefits = [
    "Overcome habit formation challenges",
    "Get personalized motivation strategies", 
    "Receive science-backed recommendations",
    "Track progress with AI insights"
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-primary-500 to-primary-600">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Trackbit
            </span>
          </motion.div>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/auth")}
            className="rounded-full bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
          >
            Get Started Free
          </motion.button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 bg-gradient-to-br from-gray-50 via-white to-primary-50">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 h-80 w-80 rounded-full bg-gradient-to-r from-primary-400/20 to-purple-400/20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-gradient-to-r from-blue-400/20 to-primary-400/20 blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <div className="inline-flex items-center rounded-full bg-primary-100 px-4 py-2 text-sm font-medium text-primary-800 mb-8">
                <Brain className="mr-2 h-4 w-4" />
                AI-Powered Habit Tracking
              </div>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl md:text-7xl"
            >
              <span className="block">Transform Your Life</span>
              <span className="block bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                One Habit at a Time
              </span>
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 sm:text-xl"
            >
              Build lasting habits with AI-powered insights, beautiful analytics, and science-backed strategies.
              Join thousands who've transformed their lives with Trackbit.
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mx-auto mt-10 flex max-w-md flex-col gap-4 sm:max-w-none sm:flex-row sm:justify-center"
            >
              <button
                onClick={() => navigate("/auth")}
                className="flex items-center justify-center rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-4 text-base font-medium text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 md:px-10 md:text-lg"
              >
                <Play className="mr-2 h-5 w-5" />
                Start Free Today
              </button>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center justify-center rounded-xl border-2 border-gray-300 px-8 py-4 text-base font-medium text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 md:px-10 md:text-lg"
              >
                Learn More
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Powerful Features for Lasting Change
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-xl text-gray-600">
              Discover the tools that make habit building effortless and effective.
              From AI insights to beautiful analytics, we've got everything you need.
            </p>
          </motion.div>

          <div className="mt-20">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-2xl hover:-translate-y-2"
                >
                  <div className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${feature.gradient} shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Meet Your AI Habit Coach
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-600">
              Get personalized coaching powered by artificial intelligence
            </p>
          </motion.div>

          {/* AI Coach Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-16 rounded-3xl bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 p-8 text-white shadow-2xl lg:p-12"
          >
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="mb-6 inline-flex items-center rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI-Powered Personal Coach
                </div>
                <h3 className="text-3xl font-bold lg:text-4xl">
                  Your Personal Habit Coach
                </h3>
                <p className="mt-4 text-lg text-purple-100">
                  Share your goals, struggles, and available time to receive tailored strategies 
                  for building better habits and achieving lasting change.
                </p>
                
                <div className="mt-8 space-y-4">
                  {coachingBenefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center space-x-3"
                    >
                      <CheckCircle className="h-5 w-5 text-green-300" />
                      <span className="text-purple-100">{benefit}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => navigate("/auth")}
                    className="btn bg-white text-purple-600 hover:bg-gray-100"
                  >
                    <Brain size={16} className="mr-2" />
                    Try AI Coach Free
                  </button>
                </div>
              </div>

              <div className="relative">
                {/* Animated Feature Cards */}
                <div className="relative h-80 overflow-hidden">
                  {aiCoachFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 50, scale: 0.9 }}
                      animate={{
                        opacity: currentFeatureIndex === index ? 1 : 0.3,
                        y: currentFeatureIndex === index ? 0 : 20,
                        scale: currentFeatureIndex === index ? 1 : 0.95,
                        zIndex: currentFeatureIndex === index ? 10 : 1
                      }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      className="absolute inset-0 rounded-2xl bg-white/10 p-6 backdrop-blur-sm"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                          {feature.icon}
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold text-white">
                            {feature.title}
                          </h4>
                          <p className="mt-2 text-purple-100">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* Chat Preview */}
                      <div className="mt-6 space-y-3">
                        <div className="flex justify-end">
                          <div className="rounded-lg bg-white/20 px-3 py-2 text-sm">
                            "I struggle with consistency"
                          </div>
                        </div>
                        <div className="flex justify-start">
                          <div className="rounded-lg bg-white px-3 py-2 text-sm text-purple-600">
                            "Let's start with the 2-minute rule..."
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Feature Indicators */}
                <div className="mt-6 flex justify-center space-x-2">
                  {aiCoachFeatures.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentFeatureIndex(index)}
                      className={`h-2 w-8 rounded-full transition-all ${
                        currentFeatureIndex === index
                          ? 'bg-white'
                          : 'bg-white/30 hover:bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* How AI Coaching Works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-gray-900">
                How AI Coaching Works
              </h3>
              <p className="mt-2 text-gray-600">
                Get personalized guidance in three simple steps
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h4 className="mb-2 text-lg font-semibold text-gray-900">
                  Share Your Goals
                </h4>
                <p className="text-gray-600">
                  Tell us about your objectives, current habits, and challenges
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h4 className="mb-2 text-lg font-semibold text-gray-900">
                  Get AI Analysis
                </h4>
                <p className="text-gray-600">
                  Our AI creates a personalized coaching strategy for you
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h4 className="mb-2 text-lg font-semibold text-gray-900">
                  Receive Guidance
                </h4>
                <p className="text-gray-600">
                  Get actionable advice and ongoing support through chat
                </p>
              </div>
            </div>
          </motion.div>

          {/* User Testimonials */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-gray-900">
                What People Says About Tracking Habits
              </h3>
            </div>
            
            <div className="grid gap-8 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="rounded-2xl bg-gray-50 p-8 shadow-lg"
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Habits Matter Section */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Why Habits Matter
              </h2>
              <p className="mt-6 text-xl text-gray-600">
                Habits shape our daily lives and determine our long-term
                success. The science is clear:
              </p>
              <div className="mt-10 space-y-6">
                {[
                  "40% of our daily actions are habits, not conscious decisions",
                  "It takes an average of 66 days to form a new habit",
                  "Small habits compound into remarkable results over time",
                  "Good habits are the foundation of personal growth",
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start"
                  >
                    <CheckCircle className="mr-4 h-6 w-6 flex-shrink-0 text-primary-500 mt-1" />
                    <p className="text-lg text-gray-600">{item}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="mt-12 lg:mt-0"
            >
              <div className="space-y-6 rounded-2xl bg-gradient-to-br from-primary-50 to-purple-50 p-8 shadow-xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  How Trackbit Helps
                </h3>
                <div className="space-y-5">
                  {[
                    "AI-powered personalized recommendations",
                    "Beautiful analytics and progress visualization",
                    "Smart reminders and routine building",
                    "Science-backed habit formation strategies",
                    "Seamless cross-platform synchronization",
                  ].map((benefit, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center space-x-3"
                    >
                      <div className="h-3 w-3 rounded-full bg-gradient-to-r from-primary-500 to-purple-500" />
                      <p className="text-gray-700 font-medium">{benefit}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-gradient-to-r from-primary-600 to-purple-600 px-8 py-16 sm:p-20"
          >
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Ready to Transform Your Life?
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-xl text-primary-100">
                Join thousands of users who have already transformed their lives with Trackbit.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <button
                  onClick={() => navigate("/auth")}
                  className="rounded-xl bg-white px-8 py-4 text-lg font-semibold text-primary-600 shadow-lg transition-all hover:shadow-xl hover:scale-105"
                >
                  Start Your Journey Today
                </button>
                <button
                  onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="rounded-xl border-2 border-white px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-white hover:text-primary-600"
                >
                  Have Questions?
                </button>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            id="contact-form"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-16 rounded-2xl bg-white p-8 shadow-xl"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Get in Touch</h3>
              <p className="mt-2 text-gray-600">Have questions? We'd love to hear from you.</p>
            </div>
            <div className="mx-auto max-w-lg">
              <form
                onSubmit={handleEnquiry}
                className="space-y-6"
              >
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    className="input w-full"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="message" className="sr-only">
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    className="input w-full resize-none"
                    placeholder="Your message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      Sending...
                    </div>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-primary-500 to-primary-600">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-white">
                Trackbit
              </span>
            </div>
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Trackbit. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;