/**
 * Google Drive Folder & File Management Service
 * Provides automated creation of organized folder structures for academic programs:
 * - Root: [Institution] Academic Program Operations
 *   - Courses & Syllabi
 *   - HLC Accreditation Reports
 *   - Assessment Artifacts & Evidence
 *   - Advisory & Workforce
 *   - Master Spreadsheets
 */

export interface DriveFolderInfo {
  id: string;
  name: string;
  webViewLink?: string;
  subfolders: { [key: string]: { id: string; name: string; webViewLink?: string } };
}

export interface DriveFileCreationResult {
  id: string;
  name: string;
  webViewLink: string;
}

/**
 * Creates a folder in Google Drive using Drive REST API v3.
 */
export async function createDriveFolder(
  accessToken: string,
  folderName: string,
  parentFolderId?: string
): Promise<{ id: string; name: string; webViewLink: string }> {
  const metadata: Record<string, any> = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };

  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const res = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Drive folder creation failed: ${errorText}`);
  }

  return await res.json();
}

/**
 * Creates the standardized academic operations folder hierarchy for a program.
 */
export async function setupProgramDriveHierarchy(
  accessToken: string,
  programCode: string,
  institutionName: string = 'Hocking College'
): Promise<DriveFolderInfo> {
  // 1. Create root parent folder
  const rootName = `[${institutionName}] Academic Operations — ${programCode}`;
  const rootFolder = await createDriveFolder(accessToken, rootName);

  // 2. Create subfolders
  const subfolderNames = [
    '1. Courses & Approved Syllabi',
    '2. HLC Accreditation Reports',
    '3. Assessment Artifacts & Direct Evidence',
    '4. Advisory Committee & Workforce Minutes',
    '5. Master Spreadsheet Databases',
  ];

  const subfolders: { [key: string]: { id: string; name: string; webViewLink?: string } } = {};

  for (const subName of subfolderNames) {
    try {
      const createdSub = await createDriveFolder(accessToken, subName, rootFolder.id);
      subfolders[subName] = createdSub;
    } catch (err) {
      console.warn(`Could not create subfolder ${subName}:`, err);
    }
  }

  const result: DriveFolderInfo = {
    id: rootFolder.id,
    name: rootFolder.name,
    webViewLink: rootFolder.webViewLink,
    subfolders,
  };

  // Cache in local storage for quick access
  localStorage.setItem(`academic_ops_drive_${programCode}`, JSON.stringify(result));
  return result;
}

/**
 * Creates a Google Doc in the specified folder with HLC Report content.
 */
export async function createHlcGoogleDoc(
  accessToken: string,
  folderId: string,
  documentTitle: string,
  htmlContent: string
): Promise<DriveFileCreationResult> {
  // 1. Create empty Google Doc in target folder
  const metadata = {
    name: documentTitle,
    mimeType: 'application/vnd.google-apps.document',
    parents: [folderId],
  };

  const res = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create Google Doc: ${errorText}`);
  }

  const file = await res.json();
  return file;
}

/**
 * Retrieves the stored Drive folder structure from localStorage or null.
 */
export function getStoredDriveFolders(programCode: string): DriveFolderInfo | null {
  try {
    const raw = localStorage.getItem(`academic_ops_drive_${programCode}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
