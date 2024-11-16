'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '../../../../lib/supabaseClient'; // Import Supabase client
import Navbar from '@/app/Owner/Header/page';


interface UserData {
  image_url: string;
  name: string;
  phone_number: string;
}

interface UserCardProps {
  imageUrl: string;
  name: string;
  phoneNumber: string;
}

const UserCard: React.FC<UserCardProps> = ({ imageUrl, name, phoneNumber }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`w-full h-80 sm:w-72 sm:h-96 relative bg-gray-800 text-white rounded-lg overflow-hidden cursor-pointer transform transition-transform duration-300 ${
        isHovered ? 'scale-105' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-gray-800 to-transparent"></div>
      <Image
        src={imageUrl}
        alt={name}
        className="w-full h-full object-cover transform scale-110 transition-transform duration-300"
      />
      <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-gray-800 to-transparent">
        <h3 className="text-lg font-bold">{name}</h3>
        <p className="text-gray-400">{phoneNumber}</p>
      </div>
    </div>
  );
};

const UserSearchCards: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from<UserData>('users') // Fetch data from 'users' table
          .select('name, phone_number, image_url');

        if (error) {
          setError('Error fetching users: ' + error.message);
        } else {
          setUsers(data || []);
        }
      } catch (err) {
        setError('An unexpected error occurred while fetching users.');
        console.error('Error fetching users:', err);
      }
    };

    if (typeof window !== 'undefined') {
      setIsClient(true);
      fetchUsers();
    }
  }, []);

  // Filter users based on search query for both name and phone number
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone_number.includes(searchQuery)
  );

  if (!isClient) {
    return null; // Render nothing on the server-side
  }

  return (
    <>
    <Navbar/>
    <div className="w-full max-w-6xl mx-auto py-8">
      <div className="flex justify-center items-center mb-8">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search by name or phone number..."
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-full pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-red-500 text-white rounded-lg p-4 mb-8">
          <p>{error}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 animate-fade-in">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user, index) => (
            <UserCard
              key={index}
              imageUrl={user.image_url}
              name={user.name}
              phoneNumber={user.phone_number}
            />
          ))
        ) : (
          <p className="text-white text-center col-span-full">
            {searchQuery ? 'No users found matching your search.' : 'No users available.'}
          </p>
        )}
      </div>
    </div>
    </>
  );
};

export default UserSearchCards;
