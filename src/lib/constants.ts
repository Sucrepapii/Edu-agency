export const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo, Democratic Republic of the", "Congo, Republic of the", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe"
];

export const QUALIFICATIONS = [
  "High School Diploma / Secondary Education",
  "Associate's Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate / PhD",
  "Post-Doctorate",
  "Vocational / Trade Certificate",
  "Other"
];

export const PROGRAM_CATEGORIES = [
  // Business & Management
  "Accounting", "Business Administration", "Economics", "Entrepreneurship", "Finance", "Human Resource Management", "International Business", "Management", "Marketing", "Supply Chain Management",
  
  // Computer Science & IT
  "Artificial Intelligence", "Computer Science", "Cybersecurity", "Data Science", "Information Technology", "Software Engineering", "Web Development",
  
  // Engineering
  "Aerospace Engineering", "Biomedical Engineering", "Chemical Engineering", "Civil Engineering", "Computer Engineering", "Electrical Engineering", "Industrial Engineering", "Mechanical Engineering", "Software Engineering",
  
  // Health & Medicine
  "Dentistry", "Health Administration", "Medicine", "Nursing", "Pharmacy", "Physical Therapy", "Public Health", "Veterinary Medicine",
  
  // Arts & Humanities
  "Art History", "English Literature", "Fine Arts", "Graphic Design", "History", "Languages and Linguistics", "Music", "Philosophy", "Theology",
  
  // Social Sciences
  "Anthropology", "Criminology", "International Relations", "Political Science", "Psychology", "Social Work", "Sociology",
  
  // Natural Sciences
  "Astronomy", "Biology", "Chemistry", "Earth Sciences", "Environmental Science", "Physics",
  
  // Mathematics & Statistics
  "Applied Mathematics", "Mathematics", "Statistics",
  
  // Education & Teaching
  "Early Childhood Education", "Educational Leadership", "Primary Education", "Secondary Education", "Special Education",
  
  // Architecture & Design
  "Architecture", "Interior Design", "Landscape Architecture", "Urban Planning",
  
  // Law & Legal Studies
  "Criminal Justice", "Law (LLB/JD)", "Legal Studies",
  
  // Media & Communications
  "Broadcasting", "Communications", "Journalism", "Media Studies", "Public Relations",
  
  // Agriculture & Forestry
  "Agriculture", "Food Science", "Forestry", "Horticulture",
  
  // Hospitality & Tourism
  "Culinary Arts", "Event Management", "Hospitality Management", "Tourism Management",
  
  "Other"
];

export const YEARS = Array.from({ length: 40 }, (_, i) => (new Date().getFullYear() + 10 - i).toString()); // 10 years in future, 30 in past
