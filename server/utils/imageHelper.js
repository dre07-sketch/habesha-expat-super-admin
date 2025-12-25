const fs = require('fs');
const path = require('path');

const getImageUrl = (req, dbPath) => {
    if (!dbPath) return null;

    // Return absolute URLs as is
    if (/^https?:\/\//i.test(dbPath)) {
        return dbPath;
    }

    // Clean the path (remove backslashes, leading slashes)
    let cleanPath = dbPath.replace(/\\/g, '/').replace(/^\/+/, '');

    // Normalize paths for Articles/Events (which historically used 'upload/') 
    // vs Settings (which uses 'uploads/')
    // If the path doesn't start with a known folder, we might need to guess or assume.
    // However, looking at the code, articles currently force 'upload/' prefix.

    // Construct the absolute physical path to check existence
    // This assumes this file is in server/utils/
    const serverRoot = path.join(__dirname, '..');
    const physicalPath = path.join(serverRoot, cleanPath);

    // Current Host (e.g., localhost:5001)
    const currentHost = `${req.protocol}://${req.get('host')}`;

    // Determine the "Other" port
    const currentPort = req.get('host').split(':')[1] || '5000';
    const otherPort = currentPort === '5000' ? '5001' : '5000';
    const otherHost = `${req.protocol}://${req.hostname}:${otherPort}`;

    if (fs.existsSync(physicalPath)) {
        return `${currentHost}/${cleanPath}`;
    } else {
        return `${otherHost}/${cleanPath}`;
    }
};

module.exports = { getImageUrl };
