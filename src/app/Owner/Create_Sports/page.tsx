'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient'; // Import supabase client
import Navbar from '@/app/Owner/Header/page';

// Dynamic input component
const DynamicInput = ({ label, name, type = 'text', value, onChange }: { label: string; name: string; type?: string; value: string; onChange: (name: string, value: string) => vosports_name }) => (
  <div className="space-y-2">
    <label htmlFor={name} className="text-gray-200">{label}</label>
    <input
      name={name}
      type={type}
      required
      className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={value}
      onChange={(e) => onChange(e.target.name, e.target.value)}
    />
  </div>
);

const SportsRegistrationForm = () => {
  const [formData, setFormData] = useState({
    sportName: '',
    sportDate: '', // Store the date here in 'YYYY-MM-DD' format
  });
  const [sports, setSports] = useState<any[]>([]); // Array to store fetched sports

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchSports = async () => {
    try {
      const { data, error } = await supabase
        .from('sports')
        .select('*'); // Fetch all fields for each sport

      if (error) {
        console.error('Error fetching sports:', error.message);
        return;
      }

      setSports(data || []);
    } catch (error) {
      console.error('Error fetching sports:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    const formattedDate = formData.sportDate; // Keep the original 'YYYY-MM-DD' format
  
    try {
      // Step 1: Check if the sport already exists
      const { data: existingData, error: fetchError } = await supabase
        .from('sports')
        .select('*')
        .eq('sports_name', formData.sportName)
        .single();
  
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking existence:', fetchError.message);
        alert('Error checking the sport existence.');
        return;
      }
  
      // Step 2: If sport exists, show an error
      if (existingData) {
        alert(`The sport "${formData.sportName}" already exists. Please choose a different name.`);
        return;
      }
  
      // Step 3: Insert the new sport
      const { data, error: insertError } = await supabase
        .from('sports')
        .insert([{ sports_name: formData.sportName, sports_date: formattedDate }]);
  
      if (insertError) {
        console.error('Error inserting data:', insertError.message);
        alert('Error creating the sport.');
        return;
      }
  
      alert('Sport created successfully!');
      setFormData({ sportName: '', sportDate: '' }); // Reset the form
      fetchSports(); // Refresh the sports list
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error processing the request.');
    }
  };
  

  const handleDelete = async (sports_name: number) => {
    try {
      const { error } = await supabase
        .from('sports')
        .delete()
        .eq('sports_name', sports_name);

      if (error) {
        console.error('Error deleting sport:', error.message);
        alert('Failed to delete the sport.');
        return;
      }

      alert('Sport deleted successfully!');
      fetchSports(); // Refresh the sports list after deletion
    } catch (error) {
      console.error('Error deleting sport:', error);
    }
  };

  useEffect(() => {
    fetchSports();
  }, []);

  return (
    <>
    
    <Navbar/>
    
    
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-gray-800 text-gray-100 flex">
        {/* Form Section */}
        <div className="w-1/2 p-6">
          <div className="text-2xl font-bold text-center text-white mb-6">Create or Update a Sport</div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <DynamicInput
              label="Sport Name"
              name="sportName"
              value={formData.sportName}
              onChange={handleChange}
            />
            <div className="space-y-2">
              <label htmlFor="sportDate" className="text-gray-200">Sport Date</label>
              <input
                name="sportDate"
                type="date"
                required
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.sportDate}
                onChange={(e) => handleChange(e.target.name, e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              Submit
            </button>
          </form>
        </div>

        {/* Sports List Section */}
        <div className="w-1/2 p-6 border-l border-gray-700">
          <div className="text-2xl font-bold text-center text-white mb-6">Sports Categories</div>
          <div className="space-y-4">
            {sports.map((sport) => (
              <div
                key={sport.sports_name}
                className="bg-gray-700 p-4 rounded shadow flex justify-between items-center text-white font-semibold"
              >
                <span>{sport.sports_name}</span>
                <button
                  onClick={() => handleDelete(sport.sports_name)}
                  className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default SportsRegistrationForm;
