"use client";

import { useState, useEffect } from "react";
import axios from "axios";

const TinderDescriptionGenerator = () => {
  const [name, setName] = useState("");
  const [interests, setInterests] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [hobbies, setHobbies] = useState("");
  const [generatedDescription, setGeneratedDescription] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleGenerateDescription = async () => {
    try {
      setGeneratedDescription("");
      setDisplayedText("");
      setIsTyping(true);

      const response = await axios.post(
        "http://localhost:8000/api/generate_tinder_description/",
        {
          name,
          interests,
          lookingFor,
          age,
          location,
          hobbies,
        }
      );

      if (response.data && response.data.response) {
        setGeneratedDescription(response.data.response);
      } else {
        alert("Coś poszło nie tak przy generowaniu opisu.");
      }
    } catch (error) {
      console.error("Błąd generowania opisu:", error);
      alert("Coś poszło nie tak przy generowaniu opisu.");
    }
  };

  useEffect(() => {
    if (generatedDescription) {
      const words = generatedDescription.split(" ");
      let index = 0;
      setDisplayedText("");

      const interval = setInterval(() => {
        if (index < words.length) {
          setDisplayedText((prev) => prev + (prev ? " " : "") + words[index]);
          index++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [generatedDescription]);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-6xl p-6 bg-white rounded-lg shadow-md mt-2">
        {/* Formularz w poziomie */}
        <div className="flex flex-wrap gap-4 justify-between">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Age"
            className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-4 justify-between mt-4">
          <input
            type="text"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="Interests"
            className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={lookingFor}
            onChange={(e) => setLookingFor(e.target.value)}
            placeholder="Looking for"
            className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={hobbies}
            onChange={(e) => setHobbies(e.target.value)}
            placeholder="Hobbies"
            className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mt-4">
          <button
            onClick={handleGenerateDescription}
            className="w-full p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Generate Description
          </button>
        </div>

        {/* Animowane generowanie tekstu */}
        <div className="mt-6">
          {displayedText && (
            <div className="p-4 bg-gray-100 rounded-md shadow-sm text-lg">
              <p className="text-gray-700">
                {displayedText}
                {isTyping && <span className="animate-pulse">|</span>}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TinderDescriptionGenerator;
