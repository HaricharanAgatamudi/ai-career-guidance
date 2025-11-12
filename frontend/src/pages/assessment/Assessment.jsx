// src/pages/assessment/Assessment.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

const Assessment = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    selectedInterests: [],
    selectedSkills: [],
    skillProficiency: {},
    workPreferences: {
      workLifeBalance: "",
      impact: "",
      autonomy: "",
      collaboration: "",
      innovation: "",
    },
    bio: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const interestOptions = [
    "Software Development", "Data Science", "Cybersecurity", "Cloud Computing",
    "Artificial Intelligence", "Game Development", "Web Design", "Graphic Design",
    "UX/UI Design", "Digital Marketing", "Content Creation", "Journalism",
    "Healthcare", "Biotechnology", "Pharmaceuticals", "Environmental Science",
    "Civil Engineering", "Mechanical Engineering", "Electrical Engineering",
    "Finance", "Investment Banking", "Accounting", "Consulting", "Human Resources",
    "Education", "Research", "Sales", "Customer Service", "Entrepreneurship",
    "Social Work", "Law", "Public Policy", "Creative Writing", "Performing Arts"
  ];

  const skillOptions = [
    "Python", "JavaScript", "Java", "C++", "SQL", "HTML/CSS", "React", "Angular",
    "Data Analysis", "Machine Learning", "Cloud Platforms (AWS/Azure/GCP)", "Cybersecurity Basics",
    "Graphic Design (tools)", "Video Editing", "Copywriting", "SEO", "Social Media Management",
    "Communication", "Problem Solving", "Critical Thinking", "Leadership", "Teamwork",
    "Adaptability", "Time Management", "Project Management", "Research", "Public Speaking",
    "Networking", "Financial Modeling", "Statistical Analysis", "Creativity", "Attention to Detail"
  ];

  const proficiencyLevels = ["Beginner", "Intermediate", "Advanced"];
  const preferenceLevels = ["Not Important", "Slightly Important", "Moderately Important", "Very Important", "Extremely Important"];
  const collaborationOptions = ["Prefer working alone", "Enjoy both", "Prefer working in a team"];

  const handleMultiSelectChange = (category, value) => {
    setAnswers((prev) => {
      const updated = prev[category].includes(value)
        ? prev[category].filter((v) => v !== value)
        : [...prev[category], value];
      return { ...prev, [category]: updated };
    });
  };

  const handleSkillProficiencyChange = (skill, level) => {
    setAnswers((prev) => ({
      ...prev,
      skillProficiency: { ...prev.skillProficiency, [skill]: level },
    }));
  };

  const handleWorkPreferenceChange = (preference, value) => {
    setAnswers((prev) => ({
      ...prev,
      workPreferences: { ...prev.workPreferences, [preference]: value },
    }));
  };

  const handleNext = async () => {
    setError("");

    if (step === 1 && answers.selectedInterests.length === 0) {
      setError("Please select at least one interest.");
      return;
    }
    if (step === 2 && answers.selectedSkills.length === 0) {
      setError("Please select at least one skill.");
      return;
    }

    if (step < 4) {
      setStep(step + 1);
    } else {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError("You must be logged in to complete the assessment.");
        navigate("/login-student");
        return;
      }

      setLoading(true);
      try {
        const studentDocRef = doc(db, "students", currentUser.uid);
        await setDoc(
          studentDocRef,
          {
            assessment: answers,
            assessmentStatus: "completed",
            lastAssessmentDate: new Date().toISOString(),
          },
          { merge: true }
        );

        console.log("Assessment saved for:", currentUser.uid);
        alert("Assessment complete! Redirecting to your personalized results...");

        // ✅ Redirect to AI-powered results page
        navigate("/career-results");
      } catch (err) {
        console.error("Error saving assessment:", err);
        setError("Failed to save assessment. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const totalSteps = 4;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-lg transition-all duration-300">
        <h2 className="text-2xl font-bold mb-2 text-gray-900">Career Assessment</h2>
        <p className="text-gray-600 mb-4 text-sm">
          Step {step} of {totalSteps} – Help us understand your strengths and preferences
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        {/* Step 1: Interests */}
        {step === 1 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              What are your top areas of interest?
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-2">
              {interestOptions.map((interest) => (
                <label
                  key={interest}
                  className={`border rounded-lg p-3 cursor-pointer text-center text-sm transition ${
                    answers.selectedInterests.includes(interest)
                      ? "bg-blue-100 border-blue-500 text-blue-800 font-medium"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={answers.selectedInterests.includes(interest)}
                    onChange={() =>
                      handleMultiSelectChange("selectedInterests", interest)
                    }
                  />
                  {interest}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Skills */}
        {step === 2 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              What skills do you have and how proficient are you?
            </h3>
            <div className="grid grid-cols-1 gap-4 max-h-80 overflow-y-auto pr-2">
              {skillOptions.map((skill) => (
                <div
                  key={skill}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition"
                >
                  <label className="font-medium text-gray-700 mb-1 sm:mb-0 w-full sm:w-auto">
                    <input
                      type="checkbox"
                      className="mr-2 accent-blue-600"
                      checked={answers.selectedSkills.includes(skill)}
                      onChange={() =>
                        handleMultiSelectChange("selectedSkills", skill)
                      }
                    />
                    {skill}
                  </label>
                  {answers.selectedSkills.includes(skill) && (
                    <div className="flex space-x-2 mt-2 sm:mt-0 w-full sm:w-auto justify-end">
                      {proficiencyLevels.map((level) => (
                        <button
                          key={level}
                          onClick={() =>
                            handleSkillProficiencyChange(skill, level)
                          }
                          className={`px-3 py-1 text-xs rounded-full transition ${
                            answers.skillProficiency[skill] === level
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Work Preferences */}
        {step === 3 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              What are your work preferences?
            </h3>
            <div className="space-y-4">
              {/* Work-Life Balance */}
              <div>
                <p className="font-medium text-gray-700 mb-2">
                  How important is work-life balance to you?
                </p>
                <div className="flex flex-wrap gap-2">
                  {preferenceLevels.map((level) => (
                    <button
                      key={level}
                      onClick={() =>
                        handleWorkPreferenceChange("workLifeBalance", level)
                      }
                      className={`px-3 py-1 text-sm rounded-full border transition ${
                        answers.workPreferences.workLifeBalance === level
                          ? "bg-blue-100 border-blue-500 text-blue-800"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Bio */}
        {step === 4 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Tell us a little about your career dreams and motivations
            </h3>
            <textarea
              value={answers.bio}
              onChange={(e) =>
                setAnswers({ ...answers, bio: e.target.value })
              }
              placeholder="Describe your ambitions, goals, and motivations..."
              className="w-full h-32 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            ></textarea>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className={`px-4 py-2 rounded-lg transition ${
              step === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Back
          </button>

          <button
            onClick={handleNext}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-lg hover:from-blue-600 hover:to-cyan-500 transition"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : step === totalSteps
              ? "Finish & Get Recommendations"
              : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Assessment;
