const fs = require('fs');
let content = fs.readFileSync('d:/project/BUS/Frontend/src/pages/OwnerDashboard.tsx', 'utf-8');
content = content.replace(/fetch\(/g, 'fetchWithAuth(');

const authFn = `
const fetchWithAuth = async (url: string, options: any = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
    ...(token ? { 'Authorization': \`Bearer \${token}\` } : {})
  };
  // Use window.fetch to avoid recursion
  return window.fetch(url, { ...options, headers });
};
`;

content = content.replace('const OwnerDashboard: React.FC = () => {', authFn + '\nconst OwnerDashboard: React.FC = () => {');
fs.writeFileSync('d:/project/BUS/Frontend/src/pages/OwnerDashboard.tsx', content);
console.log('Successfully patched fetch calls in OwnerDashboard.tsx');
