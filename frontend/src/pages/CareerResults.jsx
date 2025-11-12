// src/pages/CareerResults.jsx
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

/**
 * Simple rule-based "AI" matching:
 * - Checks overlap between user's interests & skills and career requiredSkills
 * - Uses skill proficiency to reduce gaps
 * - Adds interest match boost + trending multiplier
 *
 * This is intentionally explainable and can be replaced later with ML model.
 */

const CAREERS = [
  {
    id: "data_scientist",
    title: "Data Scientist",
    description:
      "Analyze complex data to generate insights, build predictive models, and drive data-driven decisions.",
    avgSalary: "₹10,00,000 - ₹25,00,000 / year",
    trending: 0.92, // 0-1
    requiredSkills: [
      "Python",
      "SQL",
      "Machine Learning",
      "Statistics",
      "Data Visualization",
      "Data Cleaning",
    ],
    coreInterests: ["Data Science", "Machine Learning", "Analytics"],
    outcomes: [
      "Build ML models",
      "Perform exploratory data analysis",
      "Work on AI-driven products",
      "High demand in tech & finance",
    ],
    learningPath: [
      "Python for Data Analysis (4-8 weeks)",
      "SQL & Databases (3-6 weeks)",
      "Statistics & Probability (6-12 weeks)",
      "Machine Learning fundamentals (12-24 weeks)",
      "Projects & Kaggle competitions (ongoing)",
    ],
  },
  {
    id: "lawyer",
    title: "Lawyer",
    description:
      "Provide legal advice, draft/interpret law documents, represent clients and navigate legal systems.",
    avgSalary: "₹4,00,000 - ₹15,00,000 / year",
    trending: 0.65,
    requiredSkills: [
      "Legal Research",
      "Legal Writing",
      "Analytical Thinking",
      "Negotiation",
      "Public Speaking",
    ],
    coreInterests: ["Law", "Public Policy", "Research"],
    outcomes: [
      "Practice in law firms or corporate counsel",
      "Work in public policy or NGOs",
      "Develop negotiation & litigation skills",
    ],
    learningPath: [
      "Law foundation / LLB (3-5 years)",
      "Legal research & writing workshops (6-12 weeks)",
      "Internships at law firms (3-12 months)",
      "Specialization courses (e.g., Corporate Law, IP) (3-12 months)",
    ],
  },
  {
    id: "entrepreneur",
    title: "Entrepreneur",
    description:
      "Start and grow businesses — combine vision, product-market fit, fundraising and execution skills.",
    avgSalary: "Highly variable — equity & company value driven",
    trending: 0.78,
    requiredSkills: [
      "Business Model Design",
      "Marketing",
      "Sales",
      "Financial Literacy",
      "Networking",
      "Product Management",
    ],
    coreInterests: ["Entrepreneurship", "Startup", "Business"],
    outcomes: [
      "Launch startups or social ventures",
      "Acquire fundraising & scaling experience",
      "Become founder or early-stage leader",
    ],
    learningPath: [
      "Lean Startup & Idea Validation (4-8 weeks)",
      "Basic Finance & Accounting (4-8 weeks)",
      "Marketing & Growth Hacking (8-12 weeks)",
      "Build an MVP & customer interviews (ongoing)",
      "Fundraising basics & pitch practice (ongoing)",
    ],
  },
];

function normalize(str) {
  return String(str || "").toLowerCase().trim();
}

function computeMatch(student, career) {
  // student.assessment shape expected:
  // { selectedInterests: [], selectedSkills: [], skillProficiency: { skill: 'Beginner'|... } }
  const interests = (student?.assessment?.selectedInterests || []).map(normalize);
  const skills = (student?.assessment?.selectedSkills || []).map(normalize);
  const prof = student?.assessment?.skillProficiency || {};

  // Required skills normalized
  const required = career.requiredSkills.map(normalize);

  // skill match count (any selected skill present in required)
  const matchedSkills = required.filter((rs) => skills.includes(rs));
  const skillCoverage = required.length ? matchedSkills.length / required.length : 0;

  // proficiency adjustment: if student has proficiency >= 'Intermediate' count as full match
  const proficiencyScore = required.reduce((acc, rs) => {
    const p = prof[rs] || prof[rs.charAt(0).toUpperCase() + rs.slice(1)] || "";
    // Accept variations like "Intermediate", "intermediate"
    const normP = normalize(p);
    if (normP.includes("advance") || normP.includes("intermediate")) return acc + 1;
    return acc;
  }, 0);
  const proficiencyRatio = required.length ? proficiencyScore / required.length : 0;

  // interest boost
  const careerInterests = (career.coreInterests || []).map(normalize);
  const interestMatches = careerInterests.filter((ci) => interests.includes(ci)).length;
  const interestBoost = Math.min(0.15, interestMatches * 0.07); // small boost

  // trending multiplier adds up to 10% depending on trending value
  const trendingBoost = career.trending * 0.10;

  // final score combines skill coverage (60%), proficiency (25%), interest (15%) then + trending
  const baseScore = skillCoverage * 0.6 + proficiencyRatio * 0.25 + interestBoost * 0.15;
  // scale to 0-1 and add trending
  const raw = Math.min(1, baseScore + trendingBoost);
  const percent = Math.round(raw * 100);

  // skill gaps: required skills not in student's skills or with low proficiency
  const missing = required.filter((rs) => !skills.includes(rs));
  const lowProficiency = required.filter((rs) => {
    const p = prof[rs] || "";
    const normP = normalize(p);
    return skills.includes(rs) && !normP.includes("advance") && !normP.includes("intermediate");
  });

  return {
    percent,
    raw,
    skillCoverage,
    proficiencyRatio,
    interestBoost,
    matchedSkills,
    missing,
    lowProficiency,
  };
}

const CareerCard = ({ career, stats, onFindMentors }) => {
  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-bold">{career.title}</h3>
          <p className="text-gray-600 mt-1">{career.description}</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-extrabold text-indigo-600">{stats.percent}%</div>
          <div className="text-sm text-gray-500">Match</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className="h-2 rounded-full bg-indigo-600"
            style={{ width: `${Math.min(100, stats.percent)}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Skill Gaps */}
        <div>
          <div className="font-semibold mb-2">Skill Gaps</div>
          {stats.missing.length === 0 && stats.lowProficiency.length === 0 ? (
            <div className="text-sm text-green-600">No major gaps — good fit!</div>
          ) : (
            <>
              {stats.missing.map((s) => (
                <span key={s} className="inline-block mr-2 mb-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-sm border">
                  {s}
                </span>
              ))}
              {stats.lowProficiency.map((s) => (
                <span key={s} className="inline-block mr-2 mb-2 px-3 py-1 rounded-full bg-yellow-50 text-yellow-800 text-sm border">
                  {s} (low)
                </span>
              ))}
            </>
          )}
        </div>

        {/* Learning Path */}
        <div>
          <div className="font-semibold mb-2">Learning Path</div>
          <ul className="text-sm text-gray-700 space-y-1">
            {career.learningPath.map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-indigo-500 font-medium mr-2">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Summary */}
        <div>
          <div className="font-semibold mb-2">Details</div>
          <p className="text-sm"><strong>Avg Salary:</strong> {career.avgSalary}</p>
          <p className="text-sm"><strong>Trending:</strong> {(career.trending * 100).toFixed(0)}%</p>
          <p className="text-sm mt-2"><strong>Outcomes:</strong></p>
          <ul className="list-disc ml-5 text-sm text-gray-700">
            {career.outcomes.map((o, i) => <li key={i}>{o}</li>)}
          </ul>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => onFindMentors(career)}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          Find Mentors
        </button>
        <button
          onClick={() => alert(`Full details for ${career.title}:\n\n${career.description}\n\nAvg salary: ${career.avgSalary}`)}
          className="px-4 py-2 border rounded hover:bg-gray-50 transition"
        >
          View Full Details
        </button>
      </div>
    </div>
  );
};

const CareerResults = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ranked, setRanked] = useState([]);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const u = auth.currentUser;
        if (!u) {
          // not logged in — redirect to landing or login
          navigate("/login-student");
          return;
        }

        const snap = await getDoc(doc(db, "students", u.uid));
        if (!snap.exists()) {
          // if no doc yet, redirect to personal-info
          navigate("/student/personal-info");
          return;
        }

        const data = snap.data();
        setStudent(data);

        // compute matches for careers
        const scored = CAREERS.map((c) => {
          const stats = computeMatch(data, c);
          return { career: c, stats };
        });

        // sort by score
        scored.sort((a, b) => b.stats.raw - a.stats.raw);
        setRanked(scored);
      } catch (err) {
        console.error("Error loading student or computing matches:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [navigate]);

  const onFindMentors = (career) => {
    // Navigate to Mentor list. You can enhance to pass a query param for expertise.
    navigate("/mentors", { state: { expertise: career.coreInterests } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading recommendations...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>No student data found. Please complete assessment.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-4">Your Career Recommendations</h1>
        <p className="text-center text-gray-600 mb-8">
          Based on your assessment, here are careers that match your profile. Click "Find Mentors" to connect.
        </p>

        {/* Render top 3 (we have 3) */}
        {ranked.map(({ career, stats }) => (
          <CareerCard
            key={career.id}
            career={career}
            stats={stats}
            onFindMentors={onFindMentors}
          />
        ))}

        {/* Small debug / summary */}
        <div className="mt-6 text-sm text-gray-600">
          <div><strong>Your selected interests:</strong> {(student.assessment?.selectedInterests || []).join(", ")}</div>
          <div><strong>Your skills:</strong> {(student.assessment?.selectedSkills || []).join(", ")}</div>
        </div>
      </div>
    </div>
  );
};

export default CareerResults;
