// Shared category → subcategory lookup for the role picker.
// "Other" is a free-text input the user types themselves.

export const ROLE_CATEGORIES = [
  {
    id: "engineering",
    label: "Engineering",
    subcategories: [
      "Software Engineering",
      "Mechanical Engineering",
      "Civil Engineering",
      "Electrical Engineering",
      "Chemical Engineering",
      "Aerospace Engineering",
      "Biomedical Engineering",
      "Industrial Engineering",
    ],
  },
  {
    id: "business",
    label: "Business / Finance",
    subcategories: [
      "Accounting",
      "Investment Banking",
      "Consulting",
      "Marketing",
      "Sales",
      "Human Resources",
      "Operations",
      "Product Management",
    ],
  },
  {
    id: "healthcare",
    label: "Healthcare",
    subcategories: [
      "Nursing",
      "Medicine",
      "Pharmacy",
      "Physical Therapy",
      "Dental",
      "Public Health",
    ],
  },
  {
    id: "education",
    label: "Education",
    subcategories: [
      "K-12 Teaching",
      "Higher Education",
      "Educational Administration",
      "EdTech",
    ],
  },
  {
    id: "creative",
    label: "Creative / Design",
    subcategories: [
      "Graphic Design",
      "UX / UI Design",
      "Content Writing",
      "Video / Film",
      "Photography",
    ],
  },
  {
    id: "science",
    label: "Science / Research",
    subcategories: [
      "Data Science",
      "Biology",
      "Chemistry",
      "Physics",
      "Statistics",
      "Lab Research",
    ],
  },
  {
    id: "trades",
    label: "Trades",
    subcategories: [
      "Construction",
      "Electrician",
      "Plumbing",
      "HVAC",
      "Welding",
      "Automotive",
    ],
  },
  {
    id: "legal",
    label: "Legal",
    subcategories: ["Lawyer", "Paralegal", "Compliance"],
  },
  {
    id: "other",
    label: "Other",
    subcategories: [], // free-text instead
  },
];

export const TARGET_TYPES = [
  { id: "job", label: "Full-time job" },
  { id: "internship", label: "Internship" },
  { id: "co-op", label: "Co-op" },
  { id: "contract", label: "Contract / Freelance" },
];

// Find a category by id
export function findCategory(categoryId) {
  return ROLE_CATEGORIES.find((cat) => cat.id === categoryId) || null;
}

// Build the targetRole string passed to backend Claude calls.
// For "Other" categories the subcategory is the free-text input.
export function buildTargetRole(categoryId, subcategoryOrFreeText) {
  if (!subcategoryOrFreeText) return "";
  const category = findCategory(categoryId);
  if (!category) return subcategoryOrFreeText;
  if (category.id === "other") return subcategoryOrFreeText;
  return subcategoryOrFreeText;
}
