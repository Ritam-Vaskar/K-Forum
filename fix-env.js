import fs from 'fs';

const envContent = `VITE_BACKEND_API=http://localhost:5001
MONGODB_URI=mongodb://localhost:27017/K-Forum
JWT_SECRET=supersecretkey123
EMAIL_USER=kiitritam23052346@gmail.com
EMAIL_PASS=ibwmjbhehyyothnv
PORT=5001
GEMINI_API_KEY=AIzaSyBtMeDdJAOnB8U8NuNGPm4uSTXgCv22JaE
`;

fs.writeFileSync('.env', envContent);
console.log('.env file repaired');
