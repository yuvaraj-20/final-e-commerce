import React from "react";
import { ShieldCheck, MapPin, UserCheck } from "lucide-react";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: "easeOut" },
  }),
};

const TrustSafety = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold mb-6"
      >
        Trust & Safety
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-gray-700 mb-8"
      >
        We take trust and safety seriously. These guidelines are here to make your experience secure and worry-free.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {[ 
          { Icon: ShieldCheck, title: "Verified sellers", text: "Sellers who verify their identity earn a badge to build trust." },
          { Icon: MapPin, title: "Meet in public", text: "Always meet in busy public areas and inspect items carefully." },
          { Icon: UserCheck, title: "Secure payments", text: "Use recommended methods. Avoid risky transfers." },
          { Icon: ShieldCheck, title: "Dispute support", text: "Report suspicious activity, and our team will step in." },
        ].map((item, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-start gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="p-2 rounded-full bg-indigo-50 text-indigo-600"
              >
                <item.Icon className="h-6 w-6" />
              </motion.div>
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.text}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="bg-indigo-50 border border-indigo-100 rounded-xl p-6"
      >
        <h3 className="font-semibold mb-3">Safety checklist</h3>
        <ul className="list-disc ml-6 text-gray-700 space-y-1 text-sm">
          <li>Meet during the day in public places.</li>
          <li>Bring a friend for extra safety.</li>
          <li>Check seller’s profile and reviews.</li>
          <li>Keep all communication inside the platform.</li>
        </ul>
      </motion.div>
    </div>
  );
};

export default TrustSafety;
