const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API_KEY = '0dfba9f982c03fb77410bf4d22445cfd';
const API_URL = 'http://localhost:5000/api';
const IMAGES_DIR = path.join(__dirname, '..', '3D_Portfolio_Fronend', 'public');

const PROJECTS = [
  { title: "AI Voice Agent", category: "Conversational AI", tools: "Vapi, Retell AI, OpenAI", imageFile: "/images/Solidx.png", order: 0 },
  { title: "CRM Automation Pipeline", category: "Business Automation", tools: "GoHighLevel, Webhooks, APIs", imageFile: "/images/radix.png", order: 1 },
  { title: "Lead Generation System", category: "Workflow Automation", tools: "n8n, Zapier, Make.com", imageFile: "/images/bond.png", order: 2 },
  { title: "Marketing Workflows", category: "Integrations", tools: "Node.js, Express.js, REST APIs", imageFile: "/images/sapphire.png", order: 3 },
];

const TECH_AUTOMATION = [
  { name: "n8n", file: "/images/n8n_styled.png" },
  { name: "Zapier", file: "/images/zapier_styled.png" },
  { name: "Make", file: "/images/make_styled.png" },
  { name: "OpenAI", file: "/images/openai_styled.png" }
];

const TECH_EXTRA = [
  { name: "React", file: "/images/react2.webp" },
  { name: "Next.js", file: "/images/next2.webp" },
  { name: "Node.js", file: "/images/node2.webp" },
  { name: "MongoDB", file: "/images/mongo.webp" }
];

async function uploadToImgBB(localPath) {
  try {
    const fullPath = path.join(IMAGES_DIR, localPath);
    if (!fs.existsSync(fullPath)) {
      console.error('File not found:', fullPath);
      return '';
    }
    const formData = new FormData();
    formData.append('image', fs.createReadStream(fullPath));
    const response = await axios.post(`https://api.imgbb.com/1/upload?key=${API_KEY}`, formData, {
      headers: formData.getHeaders()
    });
    console.log(`Uploaded ${localPath} -> ${response.data.data.url}`);
    return response.data.data.url;
  } catch (error) {
    console.error(`Failed to upload ${localPath}:`, error.message);
    return '';
  }
}

async function seed() {
  console.log('--- Seeding Projects ---');
  for (const p of PROJECTS) {
    const url = await uploadToImgBB(p.imageFile);
    await axios.post(`${API_URL}/projects`, {
      title: p.title,
      category: p.category,
      tools: p.tools,
      image: url,
      order: p.order
    });
  }

  console.log('\n--- Seeding Tech Stack ---');
  let order = 0;
  for (const t of TECH_AUTOMATION) {
    const url = await uploadToImgBB(t.file);
    await axios.post(`${API_URL}/techstack`, {
      name: t.name,
      imageUrl: url,
      category: 'automation',
      order: order++
    });
  }
  for (const t of TECH_EXTRA) {
    const url = await uploadToImgBB(t.file);
    await axios.post(`${API_URL}/techstack`, {
      name: t.name,
      imageUrl: url,
      category: 'extra',
      order: order++
    });
  }
  
  console.log('\nDone seeding database!');
}

seed();
