import bcrypt from 'bcryptjs';
const password = "EduAdmin@2026!";
const hash = bcrypt.hashSync(password, 10);
console.log("Generated hash:", hash);
console.log("Match check:", bcrypt.compareSync(password, hash));
console.log("Match check old hash:", bcrypt.compareSync(password, "$2b$10$yUvnPoAGYWRZ9ZUkroUW5OYulFvpDFPdT1FCku7cFBuiGoA5Mqbgm"));
