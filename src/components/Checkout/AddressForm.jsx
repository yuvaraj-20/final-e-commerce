import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function AddressForm({ onNext }) {
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  const handleChange = (e) =>
    setAddress({ ...address, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext(address);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-xl p-8 space-y-6"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-2xl font-bold mb-4">Shipping Address</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <input
          name="fullName"
          value={address.fullName}
          onChange={handleChange}
          placeholder="Full Name"
          className="border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500"
          required
        />
        <input
          name="phone"
          value={address.phone}
          onChange={handleChange}
          placeholder="Phone Number"
          className="border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500"
          required
        />
        <input
          name="street"
          value={address.street}
          onChange={handleChange}
          placeholder="Street Address"
          className="border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 col-span-2"
          required
        />
        <input
          name="city"
          value={address.city}
          onChange={handleChange}
          placeholder="City"
          className="border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500"
          required
        />
        <input
          name="state"
          value={address.state}
          onChange={handleChange}
          placeholder="State"
          className="border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500"
          required
        />
        <input
          name="pincode"
          value={address.pincode}
          onChange={handleChange}
          placeholder="Pincode"
          className="border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="bg-indigo-600 text-white px-6 py-3">
          Continue to Payment
        </Button>
      </div>
    </motion.form>
  );
}
