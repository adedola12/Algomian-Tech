// utils/driveUpload.js
import { google } from "googleapis";
import { fileURLToPath } from "url";
import path from "path";
import mime from "mime-types";
import { Readable } from "stream";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const auth = new google.auth.GoogleAuth({
  keyFile: path.resolve(__dirname, "../config/serviceAccount.json"),
  scopes: ["https://www.googleapis.com/auth/drive"],
});

// folder ID that stores all user avatars
export const DRIVE_FOLDER_ID = process.env.DRIVE_FOLDER_ID;

export const uploadBufferToDrive = async (buffer, filename) => {
  const drive = google.drive({ version: "v3", auth });
  const mimeType = mime.lookup(filename) || "application/octet-stream";

  // 1) upload
  const { data: file } = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [DRIVE_FOLDER_ID],
      mimeType,
    },
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: "id",
  });

  // 2) make it public
  await drive.permissions.create({
    fileId: file.id,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });
  // 3) get final shareable link
  const {
    data: { webContentLink },
  } = await drive.files.get({
    fileId: file.id,
    fields: "webContentLink",
  });



  
  /* webContentLink has a `&export=download` query — works in <img src>.
     You can also craft `https://drive.google.com/uc?id=<id>` */
  return `https://drive.google.com/uc?export=view&id=${file.id}`;
};
