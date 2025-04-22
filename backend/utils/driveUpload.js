// utils/driveUpload.js
import { google } from "googleapis";
import mime from "mime-types";
import fs from "fs";

const auth = new google.auth.GoogleAuth({
  keyFile: "config/serviceAccount.json",
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
      body: Buffer.from(buffer),
    },
    fields: "id, webContentLink, webViewLink",
  });

  // 2) make it public
  await drive.permissions.create({
    fileId: file.id,
    requestBody: { role: "reader", type: "anyone" },
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
  return webContentLink.replace("&export=download", "");
};
