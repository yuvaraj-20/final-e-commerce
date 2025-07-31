import React from 'react';
import { motion } from 'framer-motion';
import { Users, Sparkles, Globe, ShieldCheck } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto px-4"
        >
          <h1 className="text-5xl font-bold mb-4">About Us</h1>
          <p className="text-lg opacity-90">
            We're redefining fashion with AI — built for creators, dreamers, and global trendsetters.
          </p>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-6 text-center">Our Mission</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 text-center max-w-3xl mx-auto">
            At AI Fashion, we believe style should be smart, sustainable, and deeply personal.
            That's why we blend artificial intelligence, 3D customization, and community-driven design
            to create a fashion experience like no other.
          </p>
        </motion.div>
      </section>

      {/* Stats / Pillars */}
      <section className="py-20 bg-gray-100 dark:bg-gray-900">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto px-6">
          {[
            {
              icon: <Sparkles className="h-10 w-10 text-purple-500" />,
              title: 'Innovation-First',
              desc: 'We leverage AI and 3D to deliver hyper-personal fashion tools.',
            },
            {
              icon: <Globe className="h-10 w-10 text-blue-500" />,
              title: 'Global Impact',
              desc: 'Serving diverse communities with inclusive, eco-conscious styles.',
            },
            {
              icon: <Users className="h-10 w-10 text-green-500" />,
              title: 'Community-Centric',
              desc: 'Built around feedback, creators, and collaborative design.',
            },
            {
              icon: <ShieldCheck className="h-10 w-10 text-pink-500" />,
              title: 'Privacy & Trust',
              desc: 'Your data, your designs — always secure and in your control.',
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2, duration: 0.5 }}
              className="bg-white dark:bg-black p-6 rounded-xl shadow-md hover:shadow-xl transition"
            >
              <div className="mb-4">{item.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-purple-600 text-white text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl mx-auto px-4"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join Our Mission
          </h2>
          <p className="mb-6">
            Help shape the future of fashion with AI, creativity, and community.
          </p>
          <a
            href="/careers"
            className="inline-flex items-center px-8 py-4 bg-white text-purple-600 font-semibold rounded-full hover:bg-gray-100"
          >
            Explore Careers
          </a>
        </motion.div>
      </section>
    </div>
  );
};

export default About;
