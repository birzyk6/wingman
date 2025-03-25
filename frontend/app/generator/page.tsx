"use client";

import { useState } from "react";
import axios from "axios";

const TinderDescriptionGenerator = () => {
  const [name, setName] = useState("");
  const [interests, setInterests] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [hobbies, setHobbies] = useState("");
  const [generatedDescription, setGeneratedDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Nowy stan na błędy

  const handleGenerateDescription = async () => {
    // Resetujemy wcześniejsze błędy
    setErrorMessage("");
    setGeneratedDescription("");

    // Sprawdzamy, czy pola są wypełnione
    if (!name || !age || !location || !interests || !lookingFor || !hobbies) {
      setErrorMessage("⚠️ Proszę wprowadzić wszystkie pola!");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/generate_tinder_description/",
        {
          name,
          interests,
          lookingFor,
          age,
          location,
          hobbies,
          stream: false,
        }
      );

      if (response.data && response.data.response) {
        setGeneratedDescription(response.data.response);
      } else {
        setErrorMessage("Coś poszło nie tak przy generowaniu opisu.");
      }
    } catch (error) {
      console.error("Błąd generowania opisu:", error);
      setErrorMessage("Błąd serwera. Spróbuj ponownie później.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-6xl p-6 bg-white rounded-lg shadow-md mt-2">
        {/* Formularz */}
        <div className="flex flex-wrap gap-4 justify-between">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Age"
            className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-4 justify-between mt-4">
          <input
            type="text"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="Interests"
            className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={lookingFor}
            onChange={(e) => setLookingFor(e.target.value)}
            placeholder="Looking for"
            className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={hobbies}
            onChange={(e) => setHobbies(e.target.value)}
            placeholder="Hobbies"
            className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mt-4">
          <button
            onClick={handleGenerateDescription}
            className="w-full p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Generate Description
          </button>
        </div>

        {/* Wyświetlanie błędu */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded-md">
            {errorMessage}
          </div>
        )}

        {/* Wyświetlanie odpowiedzi */}
        {generatedDescription && (
          <div className="mt-6 p-4 bg-gray-100 rounded-md shadow-sm text-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              📌 Twój Tinder Bio:
            </h2>
            <hr className="border-gray-300 mb-2" />
            <div className="space-y-3">
              {generatedDescription.split("🔹").map((bio, index) =>
                bio.trim() ? (
                  <div
                    key={index}
                    className="p-4 border rounded-lg shadow-md bg-white"
                  >
                    {bio}
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TinderDescriptionGenerator;
