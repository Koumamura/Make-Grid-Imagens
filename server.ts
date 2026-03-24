
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import archiver from "archiver";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API route to download the project source code
  app.get("/api/download-project", async (req, res) => {
    const tempFilePath = path.join(process.cwd(), `project-${Date.now()}.zip`);
    const output = fs.createWriteStream(tempFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`ZIP created: ${archive.pointer()} total bytes`);
      res.download(tempFilePath, 'miau-tools-project.zip', (err) => {
        if (err) {
          console.error("Download error:", err);
        }
        // Delete the temp file after download (or error)
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      });
    });

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn(err);
      } else {
        throw err;
      }
    });

    archive.on('error', (err) => {
      console.error("Archiver error:", err);
      res.status(500).send({ error: "Failed to create project zip" });
    });

    archive.pipe(output);

    // Add all files from root directory
    const files = fs.readdirSync(process.cwd());
    const exclude = [
      'node_modules',
      'dist',
      '.git',
      '.next',
      '.cache',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
      '.DS_Store',
      'migrated_prompt_history',
      'project.zip' // avoid zipping the zip itself if it exists
    ];

    for (const file of files) {
      if (exclude.some(ex => file.startsWith(ex))) continue;
      
      const fullPath = path.join(process.cwd(), file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        archive.directory(fullPath, file);
      } else {
        archive.file(fullPath, { name: file });
      }
    }

    await archive.finalize();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
