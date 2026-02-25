import fs from 'fs';
import path from 'path';

// Usage: 
// 1. Install required package: npm install axios
// 2. Set your API key in the script or in your environment variables.
// 3. Run: node generate_questions.js

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY_HERE';

const generateReadAloud = async (count = 5) => {
    console.log(`Generating ${count} Read Aloud questions...`);

    // The prompt is very specific so the AI outputs valid JSON matching your structure
    const prompt = `Generate ${count} PTE Academic 'Read Aloud' questions in JSON format.
Each item should be an object with the following properties:
- id: integer (starting from 1)
- topic: string (e.g. Science, History, Environment)
- content: string (A paragraph of 50 to 60 words, academically written, for the user to read aloud)

Respond ONLY with a valid JSON array of objects.`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error('API Error:', data.error.message);
            return;
        }

        const jsonContent = data.choices[0].message.content;

        // Clean up markdown syntax if AI added it (e.g., \`\`\`json ... \`\`\`)
        const cleanedJson = jsonContent.replace(/```json/g, '').replace(/```/g, '').trim();

        const parsedData = JSON.parse(cleanedJson);

        // Save to file
        const outputFile = path.resolve('src/data/speakingReadAloudData.json');

        // Create directory if it doesn't exist
        if (!fs.existsSync(path.dirname(outputFile))) {
            fs.mkdirSync(path.dirname(outputFile), { recursive: true });
        }

        fs.writeFileSync(outputFile, JSON.stringify(parsedData, null, 2));
        console.log(`✅ Successfully saved ${count} Read Aloud questions to ${outputFile}`);

    } catch (error) {
        console.error('Error generating data:', error.message);
    }
};

// If you want to use the script from the terminal
generateReadAloud(5);

