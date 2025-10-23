import { authHelper } from './authHelper';

const graphConfig = {
  graphEndpoint: "https://graph.microsoft.com/v1.0",
  sharePointSiteUrl: "https://graph.microsoft.com/v1.0/sites/root?select=id,drive"
};

// Must use named export (not default)
export const sharePointService = {
  async getMySites(searchTerm = '*') {
    try {
      const response = await this.makeGraphRequest(
        `sites?search=${searchTerm}`
      );
      return response.value || [];
    } catch (error) {
      console.error('Error fetching sites:', error);
      return [];
    }
  },
  async getSharedThroughOneDrive() {
    const response = await this.makeGraphRequest(
      "me/drive/sharedWithMe"
    );
    return response.value || [];
  },
  async getSharedWithMeSites() {
    try {
      // First get all sites
      const allSites = await this.makeGraphRequest("sites?search=*");

      // Then check permissions for each site
      const sitesWithPermissions = await Promise.all(
        allSites.value.map(async site => {
          const permissions = await this.makeGraphRequest(
            `sites/${site.id}/permissions`
          );
          return {
            ...site,
            permissions: permissions.value
          };
        })
      );

      // Filter sites where you have direct permissions
      return sitesWithPermissions.filter(site =>
        site.permissions.some(p =>
          p.grantedToIdentities?.some(identity =>
            identity.user?.id === "your-user-id" // Replace with actual user ID
          )
        )
      );
    } catch (error) {
      console.error('Error checking shared sites:', error);
      return [];
    }
  },
  async getDefaultDrive(siteId) {
    const token = await authHelper.acquireTokenSilently(['Sites.ReadWrite.All']);
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/sites/${siteId}/drive`,
      {
        headers: {
          'Authorization': `Bearer ${token.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get default drive: ${response.status}`);
    }

    return {
      id: siteId,
      drive: await response.json()
    };
  },
  async getSiteInfo() {
    try {
      const token = await authHelper.acquireTokenSilently(['Sites.ReadWrite.All']);
      const response = await fetch("https://graph.microsoft.com/v1.0/sites/root", {
        headers: {
          'Authorization': `Bearer ${token.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const siteInfo = await response.json();

      // Verify the response structure
      if (!siteInfo.drive) {
        // If no drive, try to get the default drive explicitly
        return await this.getDefaultDrive(siteInfo.id);
      }

      return siteInfo;
    } catch (error) {
      console.error('Error getting site info:', error);
      throw error;
    }
  },
  async getSiteDetails(siteName) {
    const response = await this.makeGraphRequest(
      `sites/stxgmail.sharepoint.com:/sites/${siteName}`
    );
    return response;
  },
  async getDrives(siteId) {
    const token = await authHelper.acquireTokenSilently(['Sites.ReadWrite.All']);
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/sites/${siteId}/drives`,
      {
        headers: {
          'Authorization': `Bearer ${token.accessToken}`
        }
      }
    );
    const data = await response.json();
    return data.value || [];
  },
  async getDriveContents(siteId, driveName = 'Documents') {
    try {
      // Get the specific document library
      const drives = await this.makeGraphRequest(
        `sites/${siteId}/drives?$filter=name eq '${driveName}'`
      );

      if (!drives.value || drives.value.length === 0) {
        throw new Error('Document library not found');
      }

      const driveId = drives.value[0].id;
      return await this.makeGraphRequest(
        `drives/${driveId}/root/children`
      );
    } catch (error) {
      console.error('Error loading drive contents:', error);
      return { value: [] };
    }
  },
  async getFolderContents(driveId, folderId = 'root', options = {}) {
    try {
      const token = await authHelper.acquireTokenSilently(['Files.ReadWrite.All']);

      // Construct the base URL
      const baseUrl = folderId === 'root'
        ? `${graphConfig.graphEndpoint}/drives/${driveId}/root`
        : `${graphConfig.graphEndpoint}/drives/${driveId}/items/${folderId}`;

      // let url;
      // if (folderId === 'root') {
      //   url = `${graphConfig.graphEndpoint}/sites/${driveId}/drive/root/children?$filter=folder ne null`;
      // } else {
      //   url = `${graphConfig.graphEndpoint}/sites/${driveId}/drive/items/${folderId}/children?$filter=folder ne null`;
      // }

      // Build query parameters
      const params = new URLSearchParams();

      if (options.filter === 'folders') {
        params.append('$filter', 'folder ne null');
      } else if (options.filter === 'files') {
        params.append('$filter', 'file ne null');
      }

      if (options.search) {
        params.append('$search', `"${options.search}"`);
      }

      const url = `${baseUrl}/children?${params.toString()}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token.accessToken}`,
          'ConsistencyLevel': 'eventual'
        }
      });

      const data = await response.json();
      return data.value || [];

    } catch (error) {
      console.error('Error loading contents:', error);
      return [];
    }
  },
  async getFileFromUrl(fileUrl) {
    try {
      const token = await authHelper.acquireTokenSilently(['Files.ReadWrite.All']);
      const response = await fetch(fileUrl, {
        headers: {
          'Authorization': `Bearer ${token.accessToken}`
        }
      });
      const data = await response.json();
      const blob = await response.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]); // base64 string
        reader.onerror = reject;
        reader.onloadend = () => {
          // Extract base64 string
          const base64File = reader.result.split(',')[1];
          // Extract mime type and extension from the Data URL
          const mimeMatch = reader.result.match(/^data:(.*?);base64,/);
          const mime = mimeMatch ? mimeMatch[1] : '';
          // Try to get extension from mime type
          const ext = mime.split('/')[1] || '';
          resolve({
            base64File,
            ext,
            mime
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error loading file:', error);
      return [];
    }
  },
  async getFileFromSharePoint(fileId, driveId, result = 'content') {
    try {
      if (result === 'preview') {
        // Return the preview URL for the file
        const token = await authHelper.acquireTokenSilently(['Files.ReadWrite.All']);
        const response = await fetch(
          `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${fileId}/preview`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token.accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        if (!response.ok) {
          throw new Error(`Failed to get preview: ${response.status}`);
        }
        return await response.json();
      }

      const token = await authHelper.acquireTokenSilently(['Files.ReadWrite.All']);

      // 1. Get file metadata first
      const metadataResponse = await fetch(
        `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${fileId}`,
        {
          headers: {
            'Authorization': `Bearer ${token.accessToken}`
          }
        }
      );

      const metadata = await metadataResponse.json();

      // 2. Get file content
      const fileResponse = await fetch(
        `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${fileId}/${result}`,
        {
          headers: {
            'Authorization': `Bearer ${token.accessToken}`,
            'Accept': 'application/octet-stream'
          }
        });

      const blob = await fileResponse.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64File = reader.result;
          const mimeType = metadata.file.mimeType || 'application/octet-stream';
          const ext = metadata.name.split('.').pop() || '';
          resolve({
            base64File,
            ext,
            mime: mimeType,
            fileName: metadata.name
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

    } catch (error) {
      console.error('Error loading file:', error);
      throw error;
    }
  },
  async makeGraphRequest(endpoint) {
    const account = authHelper.getActiveAccount();
    if (!account) {
      throw new Error('No active account found. Please login first.');
    }

    const token = await authHelper.acquireTokenSilently(['Files.ReadWrite.All']);
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/${endpoint}`,
      {
        headers: {
          'Authorization': `Bearer ${token.accessToken}`,
          'ConsistencyLevel': 'eventual'
        }
      }
    );
    return await response.json();
  },
  async createAnonymousLink(siteId, driveId, itemId, linkType = 'view') {
    try {
      const token = await authHelper.acquireTokenSilently(['Sites.ReadWrite.All']);
      const endpoint = `sites/${siteId}/drives/${driveId}/items/${itemId}/createLink`;

      const requestBody = {
        type: linkType,
        scope: 'anonymous'
      };

      const response = await fetch(
        `${graphConfig.graphEndpoint}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
      );

      if (!response.ok) {
        throw new Error(`Failed to create link: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating anonymous link:", error);
      throw error;
    }
  },

  /**
   * Mengundang pengguna ke file atau folder dengan izin spesifik.
   * @param {string} siteId ID unik dari situs SharePoint.
   * @param {string} driveId ID unik dari pustaka dokumen (drive).
   * @param {string} itemId ID unik dari file atau folder.
   * @param {Object[]} recipients Array objek dengan properti 'email' atau 'id'.
   * @param {string} role Peran izin ('read' atau 'write').
   * @param {string} message Pesan email undangan.
   * @returns {Promise<Object>} Objek respons.
   */
  async inviteUser(siteId, driveId, itemId, recipients, role = 'read', message = '') {
    try {
      const token = await authHelper.acquireTokenSilently(['Sites.ReadWrite.All']);
      const endpoint = `sites/${siteId}/drives/${driveId}/items/${itemId}/invite`;

      const requestBody = {
        recipients,
        message,
        requireSignIn: true,
        sendInvitation: true,
        roles: [role]
      };

      const response = await fetch(
        `${graphConfig.graphEndpoint}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
      );

      if (!response.ok) {
        throw new Error(`Failed to invite user: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error inviting user:", error);
      throw error;
    }
  },
  async getSharedContent(sharingUrl, isFilesObject = false) {
    try {
      const token = await authHelper.acquireTokenSilently(['Sites.ReadWrite.All']);

      // Mengonversi URL menjadi base64 untuk mendapatkan sharing token.
      // Microsoft Graph API menggunakan format 'u!BASE64_URL' sebagai shareId.
      const base64Url = btoa(sharingUrl).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      const shareId = `u!${base64Url}`;

      // Endpoint untuk mendapatkan driveItem dari sharing token.
      const endpoint = `shares/${shareId}/driveItem`;

      const response = await fetch(
        `${graphConfig.graphEndpoint}/${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token.accessToken}`,
          'ConsistencyLevel': 'eventual'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to get shared content: ${response.status} - ${errorData.error.message}`);
        return null;
      }

      const data = await response.json();

      // Jika item adalah folder, ambil daftar isinya (children)
      if (data.folder) {
        const folderContentsEndpoint = `shares/${shareId}/driveItem/children`;
        const contentsResponse = await fetch(
          `${graphConfig.graphEndpoint}/${folderContentsEndpoint}`, {
          headers: {
            'Authorization': `Bearer ${token.accessToken}`,
            'ConsistencyLevel': 'eventual'
          }
        });
        const contentsData = await contentsResponse.json();
        return contentsData.value || [];
      } else {
        // Jika item adalah file, kembalikan objek file itu sendiri

        if (!isFilesObject) {
          return data;
        }
        // Fetch the file content as blob and convert to base64
        const fileResponse = await fetch(
          `${graphConfig.graphEndpoint}/shares/${shareId}/driveItem/content`, {
          headers: {
            'Authorization': `Bearer ${token.accessToken}`,
            'Accept': 'application/octet-stream'
          }
        }
        );
        const blob = await fileResponse.blob();
        return await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result;
            const base64File = result;
            const mimeMatch = result.match(/^data:(.*?);base64,/);
            const mime = mimeMatch ? mimeMatch[1] : '';
            const ext = mime.split('/')[1] || '';
            resolve({
              base64File,
              ext,
              mime
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

    } catch (error) {
      console.error("Error getting shared content:", error);
      return null;
    }
  },
  async getSharedContentNew(sharingUrl, isFilesObject = false, isPublic = false, tryCount = 0) {
    try {
      let headers = {
        'ConsistencyLevel': 'eventual'
      };

      // Kalau bukan public, ambil token
      if (!isPublic) {
        const token = await authHelper.acquireTokenSilently(['Sites.ReadWrite.All']);
        headers['Authorization'] = `Bearer ${token.accessToken}`;
      }

      // Convert URL ke base64 (shareId format Microsoft Graph)
      const base64Url = btoa(sharingUrl)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
      const shareId = `u!${base64Url}`;

      // Endpoint driveItem utama
      const endpoint = `shares/${shareId}/driveItem`;

      const response = await fetch(`${graphConfig.graphEndpoint}/${endpoint}`, { headers });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to get shared content: ${response.status} - ${errorData.error.message}`);
        return null;
      }

      const data = await response.json();

      // Kalau folder, ambil isinya
      if (data.folder) {
        const folderContentsEndpoint = `shares/${shareId}/driveItem/children`;
        const contentsResponse = await fetch(
          `${graphConfig.graphEndpoint}/${folderContentsEndpoint}`,
          { headers }
        );
        const contentsData = await contentsResponse.json();
        return contentsData.value || [];
      } else {
        // Kalau file
        if (!isFilesObject) {
          return data;
        }

        // Ambil file sebagai blob → base64
        const fileResponse = await fetch(
          `${graphConfig.graphEndpoint}/shares/${shareId}/driveItem/content`,
          {
            headers: {
              ...headers,
              'Accept': 'application/octet-stream'
            }
          }
        );

        const blob = await fileResponse.blob();
        return await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result;
            const base64File = result;
            const mimeMatch = result.match(/^data:(.*?);base64,/);
            const mime = mimeMatch ? mimeMatch[1] : '';
            const ext = mime.split('/')[1] || '';
            resolve({
              base64File,
              ext,
              mime
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
    } catch (error) {
      if (tryCount < 1 && !isPublic) {
        const getAuth = await authHelper.login(["Sites.ReadWrite.All"]);
        if (getAuth) {
          return this.getSharedContentNew(sharingUrl, isFilesObject, isPublic, tryCount + 1);
        } else {

          console.log("Cannot get the access token silently");
          return null
        }
      }

      console.error("Error getting shared content:", error);
      return null;
    }
  }
  ,
  /**
   * Upload file to SharePoint and get its preview URL
   * @param {string} siteId ID of the SharePoint site
   * @param {string} driveId ID of the drive
   * @param {string} fileName Name for the file
   * @param {string|File|Blob} fileContent File content (base64 string, File object, or Blob)
   * @param {string} folderId ID of the folder to upload to (default: 'root')
   * @returns {Promise<Object>} Object containing file info and preview URL
   */
  async uploadAndOpenFile(siteId, driveId, fileName, fileContent, folderId = 'root') {
    try {
      const token = await authHelper.acquireTokenSilently(['Files.ReadWrite.All']);

      // Construct upload URL
      const uploadPath = folderId === 'root'
        ? `drives/${driveId}/root:/${fileName}:/content`
        : `drives/${driveId}/items/${folderId}:/${fileName}:/content`;

      let uploadBody;

      // Handle different file content types
      if (typeof fileContent === 'string') {
        // Base64 string
        const base64Data = fileContent.includes(',') ? fileContent.split(',')[1] : fileContent;
        uploadBody = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      } else if (fileContent instanceof File || fileContent instanceof Blob) {
        // File or Blob object
        uploadBody = fileContent;
      } else {
        throw new Error('Unsupported file content type');
      }

      // Upload file
      const uploadResponse = await fetch(
        `${graphConfig.graphEndpoint}/${uploadPath}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token.accessToken}`,
            'Content-Type': 'application/octet-stream'
          },
          body: uploadBody
        }
      );

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }

      const fileData = await uploadResponse.json();

      // Get preview URL
      const previewResponse = await fetch(
        `${graphConfig.graphEndpoint}/drives/${driveId}/items/${fileData.id}/preview`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      let previewUrl = null;
      if (previewResponse.ok) {
        const previewData = await previewResponse.json();
        previewUrl = previewData.getUrl;
      }

      return {
        file: fileData,
        previewUrl,
        webUrl: fileData.webUrl,
        downloadUrl: fileData['@microsoft.graph.downloadUrl']
      };

    } catch (error) {
      console.error('Error uploading and opening file:', error);
      throw error;
    }
  },

  /**
  async uploadToTempAndOpen(fileContent, fileName) {
    try {
      // Check if there's an active account first
      const account = authHelper.getActiveAccount();
      if (!account) {
        throw new Error('No active account found. Please login first.');
      }

      // Get user's OneDrive using the me/drive endpoint
      const token = await authHelper.acquireTokenSilently(['Files.ReadWrite.All']);
   */
  async uploadToTempAndOpen(fileContent, fileName) {
    try {
      // Get user's OneDrive using the me/drive endpoint
      const token = await authHelper.acquireTokenSilently(['Files.ReadWrite.All']);

      // Create temp folder if it doesn't exist
      const tempFolderName = 'TempFiles';
      let tempFolder;

      try {
        const response = await fetch(
          `${graphConfig.graphEndpoint}/me/drive/root:/${tempFolderName}`,
          {
            headers: {
              'Authorization': `Bearer ${token.accessToken}`
            }
          }
        );

        if (response.ok) {
          tempFolder = await response.json();
        } else if (response.status === 404) {
          // Folder doesn't exist, create it
          const createFolderResponse = await fetch(
            `${graphConfig.graphEndpoint}/me/drive/root/children`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token.accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                name: tempFolderName,
                folder: {}
              })
            }
          );

          if (!createFolderResponse.ok) {
            throw new Error(`Failed to create temp folder: ${createFolderResponse.status}`);
          }

          tempFolder = await createFolderResponse.json();
        } else {
          throw new Error(`Failed to access temp folder: ${response.status}`);
        }
      } catch (error) {
        if (error.message.includes('Failed to')) {
          throw error;
        }
        // If makeGraphRequest fails, try to create the folder
        const createFolderResponse = await fetch(
          `${graphConfig.graphEndpoint}/me/drive/root/children`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token.accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: tempFolderName,
              folder: {}
            })
          }
        );

        if (!createFolderResponse.ok) {
          throw new Error(`Failed to create temp folder: ${createFolderResponse.status}`);
        }

        tempFolder = await createFolderResponse.json();
      }

      // Get drive ID from the drive response
      const driveResponse = await this.makeGraphRequest('me/drive');
      const driveId = driveResponse.id;

      // Upload file to temp folder
      const uploadFile = await this.uploadAndOpenFile(
        null, // siteId not needed for OneDrive
        driveId,
        fileName,
        fileContent,
        tempFolder.id
      );

      if (uploadFile) {
        return this.getFileFromSharePoint(uploadFile.file.id, driveId, 'preview');
      }

    } catch (error) {
      console.error('Error uploading to temp location:', error);
      throw error;
    }
  }
};
