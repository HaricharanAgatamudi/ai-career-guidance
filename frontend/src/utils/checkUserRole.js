// src/utils/checkUserRole.js
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Returns "student", "mentor", or "none"
 * Usage: const role = await checkUserRole(uid);
 */
export async function checkUserRole(uid) {
  if (!uid) return "none";

  try {
    const studentRef = doc(db, "students", uid);
    const mentorRef = doc(db, "mentors", uid);

    const studentSnap = await getDoc(studentRef);
    if (studentSnap.exists()) return "student";

    const mentorSnap = await getDoc(mentorRef);
    if (mentorSnap.exists()) return "mentor";

    return "none";
  } catch (err) {
    console.error("checkUserRole error:", err);
    return "none";
  }
}
