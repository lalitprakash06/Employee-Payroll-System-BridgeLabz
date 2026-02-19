const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '../employees.json');

const read = async () => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist yet, return an empty array
        if (error.code === 'ENOENT') return [];
        console.error("Read Error:", error);
        throw error;
    }
};

const write = async (data) => {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error("Write Error:", error);
        throw error;
    }
};

module.exports = { read, write };