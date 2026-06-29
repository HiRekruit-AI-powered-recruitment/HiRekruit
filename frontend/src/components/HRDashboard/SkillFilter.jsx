import React, { useMemo, useState } from "react";
import PRESET_SKILLS from "../../constants/skills.js";

const SkillFilter = ({ skills, setSkills }) => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return PRESET_SKILLS.filter(
      (s) => s.toLowerCase().includes(q) && !skills.includes(s)
    );
  }, [query, skills]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(value.trim().length > 0);
  };

  const addSkill = (skill) => {
    const updated = [...skills, skill];
    console.log("Updated skills:", updated);
    setSkills(updated);
    setQuery("");
    setShowSuggestions(false);
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  return (
    <div className="mt-6">
      <label className="block text-sm text-gray-600 mb-2">
        Filter by Skills
      </label>
      <div className="relative">
        <input
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(query.trim().length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="Type skills to search (e.g., Java, React, Python...)"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none  focus:ring-2 focus:ring-black transition-all"
        />

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-44 overflow-auto">
            {suggestions.map((skill) => (
              <button
                key={skill}
                onMouseDown={() => addSkill(skill)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
              >
                <span className="font-medium text-gray-800">{skill}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {skills.length > 0 && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-2 text-sm bg-black text-white border  px-3 py-1.5 rounded-full shadow-sm hover:shadow-md transition-all duration-200"
              >
                <span className="font-medium">{skill}</span>
                <button
                  onClick={() => removeSkill(skill)}
                  className="text-white hover:text-black hover:bg-white  rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold transition-all duration-150"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <button
            onClick={() => setSkills([])}
            className="mt-3 text-xs text-gray-500 hover:text-gray-700 underline transition-colors"
          >
            Clear all skills
          </button>
        </div>
      )}
    </div>
  );
};

export default SkillFilter;
