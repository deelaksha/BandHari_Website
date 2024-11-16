'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';
import { CircleDot } from 'lucide-react';
import Navbar from '@/app/Owner/Header/page';

interface SportCategory {
  sports_name: string;
  sports_date: string;
}

const SportsRegistrationCards = () => {
  const [categories, setCategories] = useState<SportCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data: fetchedData, error } = await supabase
          .from<SportCategory>('sports')
          .select('sports_name, sports_date');

        if (error) {
          console.error('Error fetching data:', error);
          setError('Error fetching sports categories.');
        } else {
          setCategories(fetchedData || []);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred while fetching data.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Function to handle card click and navigate to Create_Team with sports_name as a query parameter
  const handleCardClick = (sportsName: string) => {
    router.push(`/Owner/Create_Team?sport=${encodeURIComponent(sportsName)}`);
  };

  // Function to handle card click and navigate to Points_Table with sports_name as a query parameter
  const handlePointsTableClick = (sportsName: string) => {
    router.push(`/Owner/Points_Table?sport=${encodeURIComponent(sportsName)}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">Bengaluru Sports</h1>
          <p className="text-lg text-gray-300">Hosted by Haribasegowda</p>
        </div>

        {error ? (
          <div className="bg-red-500 text-white rounded-lg p-4 mb-8">
            <p>{error}</p>
          </div>
        ) : null}

        {categories.length === 0 ? (
          <p className="text-center text-white">No sports categories available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div
                key={category.sports_name}
                className="relative bg-gray-800 rounded-lg p-6 shadow-lg transform transition-all duration-300 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-900">
                    <CircleDot className="w-8 h-8" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-4">{category.sports_name}</h3>

                <div className="flex items-center text-gray-300">
                  <span>Starts {new Date(category.sports_date).toLocaleDateString()}</span>
                </div>

                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => handleCardClick(category.sports_name)}
                    className="px-4 py-2 bg-green-600 text-white rounded"
                  >
                    Create Team
                  </button>

                  <button
                    onClick={() => handlePointsTableClick(category.sports_name)}
                    className="px-4 py-2 bg-red-600 text-white rounded"
                  >
                    Points Table
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default SportsRegistrationCards;
