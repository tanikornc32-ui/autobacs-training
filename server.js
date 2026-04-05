const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3456;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

const server = http.createServer((req, res) => {
  // Copy endpoint
  if (req.url === "/api/copy-to-desktop") {
    try {
      const destDir = path.join("C:", "Users", "ASUS", "Desktop", "autobacs-training", "public");
      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(path.join(__dirname, "public", "index.html"), path.join(destDir, "index.html"));
      fs.copyFileSync(path.join(__dirname, "server.js"), path.join("C:", "Users", "ASUS", "Desktop", "autobacs-training", "server.js"));
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, path: "C:\\Users\\ASUS\\Desktop\\autobacs-training\\" }));
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  let filePath = req.url === "/" ? "/index.html" : req.url;
  filePath = path.join(__dirname, "public", filePath);

  const ext = path.extname(filePath);
  const contentType = MIME[ext] || "text/plain";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA fallback
      fs.readFile(path.join(__dirname, "public", "index.html"), (err2, data2) => {
        if (err2) {
          res.writeHead(404);
          res.end("Not Found");
        } else {
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          res.end(data2);
        }
      });
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Autobacs Training server running at http://localhost:${PORT}`);
});
