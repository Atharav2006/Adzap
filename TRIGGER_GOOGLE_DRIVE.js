// ============================================
// Google Drive Upload Handler
// COPY THIS ENTIRE FILE content
// ============================================

// CONFIGURATION
// The Folder ID where files will be saved
const FOLDER_ID = '1r911mqzJVftfG1UqgAAv4YF-PhfLzNTu';

function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);
        const filename = data.filename;
        const mimeType = data.mimeType;
        const base64Data = data.base64; // The file content sent from frontend

        // Decode base64
        const decoded = Utilities.base64Decode(base64Data);
        const blob = Utilities.newBlob(decoded, mimeType, filename);

        // Save to Drive
        const folder = DriveApp.getFolderById(FOLDER_ID);
        const file = folder.createFile(blob);

        // Set public permissions (optional, depends on need)
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

        return ContentService.createTextOutput(JSON.stringify({
            status: 'success',
            fileUrl: file.getUrl(),
            filename: filename
        })).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            status: 'error',
            message: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

// OPTIONS request handler for CORS
function doOptions(e) {
    return ContentService.createTextOutput('');
}
