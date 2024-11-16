'use client';
import Image from 'next/image';
import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Camera, Gamepad2, Trophy, Loader2, CheckCircle, X } from 'lucide-react';
import Navbar from '@/app/Header/page';

const LoadingButton = ({ loading, children, onClick, className }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className={`relative flex items-center justify-center p-2 rounded-lg transition-all duration-300 ${className}`}
  >
    {loading ? <Loader2 className="animate-spin" size={24} /> : children}
  </button>
);

const InputField = ({ icon: Icon, placeholder, value, onChange, name, type = 'text' }) => (
  <div className="relative group">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 transition-all duration-300 group-hover:scale-110">
      <Icon size={20} />
    </div>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-purple-500 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none transition-all duration-300 text-white placeholder-gray-400 group-hover:border-purple-400"
    />
  </div>
);

const ImagePreview = ({ image, onRemove }) => (
  <div className="relative">
    <Image src={image} alt="Preview" className="w-32 h-32 object-cover rounded-lg border-2 border-purple-500" />
    <button onClick={onRemove} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600 transition-colors duration-300">
      <X size={16} className="text-white" />
    </button>
  </div>
);

const GamingRegistrationForm = () => {
  const [formData, setFormData] = useState({ name: '', mobile: '', tournamentCode: '' });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Fetch valid tournament codes from the database
      const { data: validCodes, error } = await supabase
        .from('tournament_code')
        .select('code');

      if (error) throw error;

      const validCodeList = validCodes.map((item) => item.code);

      // Validate the input tournament code
      if (!validCodeList.includes(formData.tournamentCode)) {
        alert('Invalid Tournament Code');
        setLoading(false);
        return;
      }

      // Upload the image to Supabase storage if there's an image
      let imageUrl = null;
      if (imageFile) {
        const { data, error } = await supabase.storage
          .from('images/public')
          .upload(`players/${Date.now()}-${imageFile.name}`, imageFile);
        if (error) throw error;

        imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/public/${data.path}`;
      }

      // Insert data into Supabase 'users' table
      const { error: insertError } = await supabase.from('users').insert({
        name: formData.name,
        phone_number: formData.mobile,
        image_url: imageUrl,
      });

      if (insertError) throw insertError;

      setSubmitted(true);
    } catch (error) {
      console.error('Error:', error.message);
      alert('Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-xl p-6 space-y-6">
          {!submitted ? (
            <>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-purple-500 flex items-center justify-center gap-2">
                  <Trophy className="animate-pulse" />
                  Tournament Registration
                </h2>
                <div className="flex justify-center gap-2 mt-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${step >= i ? 'bg-purple-500' : 'bg-gray-600'} transition-colors duration-300`}
                    />
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {step === 1 && (
                  <div className="space-y-4 animate-fadeIn">
                    <InputField icon={Gamepad2} placeholder="Player Name" name="name" value={formData.name} onChange={handleInputChange} />
                    <LoadingButton loading={loading} onClick={() => setStep(2)} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      Next Level →
                    </LoadingButton>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4 animate-fadeIn">
                    <InputField
                      icon={Gamepad2}
                      placeholder="Mobile Number"
                      name="mobile"
                      type="tel"
                      value={formData.mobile}
                      onChange={handleInputChange}
                    />
                    <InputField
                      icon={Trophy}
                      placeholder="Tournament Code"
                      name="tournamentCode"
                      value={formData.tournamentCode}
                      onChange={handleInputChange}
                    />
                    <div className="flex gap-2">
                      <LoadingButton loading={false} onClick={() => setStep(1)} className="w-1/2 bg-gray-600 hover:bg-gray-700 text-white">
                        ← Back
                      </LoadingButton>
                      <LoadingButton loading={false} onClick={() => setStep(3)} className="w-1/2 bg-purple-600 hover:bg-purple-700 text-white">
                        Next Level →
                      </LoadingButton>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="relative">
                      <input
                        type="file"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                        accept="image/*"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-purple-500 rounded-lg cursor-pointer hover:border-purple-400 transition-colors duration-300"
                      >
                        {imagePreview ? (
                          <ImagePreview image={imagePreview} onRemove={() => setImagePreview(null)} />
                        ) : (
                          <>
                            <Camera className="w-8 h-8 text-purple-500" />
                            <span className="mt-2 text-sm text-purple-500">Upload your gamer pic</span>
                          </>
                        )}
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <LoadingButton
                        loading={false}
                        onClick={() => setStep(2)}
                        className="w-1/2 bg-gray-600 hover:bg-gray-700 text-white"
                      >
                        ← Back
                      </LoadingButton>
                      <LoadingButton
                        loading={loading}
                        onClick={handleSubmit}
                        className="w-1/2 bg-green-600 hover:bg-green-700 text-white"
                      >
                        Complete Registration
                      </LoadingButton>
                    </div>
                  </div>
                )}
              </form>
            </>
          ) : (
            <div className="text-center space-y-4 animate-fadeIn">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto animate-bounce" />
              <h3 className="text-xl font-bold text-white">Registration Complete!</h3>
              <p className="text-gray-400">Get ready for the tournament!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GamingRegistrationForm;
