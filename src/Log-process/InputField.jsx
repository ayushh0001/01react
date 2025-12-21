import React from 'react';

/**
 * InputField component to reduce repetition for inputs
 * Props:
 * - label: string
 * - id: string
 * - name: string
 * - type: string
 * - value: string
 * - placeholder: string
 * - onChange: function
 * - maxLength: number
 */
const InputField = ({ label, id, name, type = 'text', value, placeholder, onChange, maxLength }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition duration-150"
    />
  </div>
);

export default InputField;
