const express = require("express");
const path = require("path");
const port = 8080;

const app = express();

app.use(express.static(path.join(__dirname, "src")));
app.use("/node_modules", express.static(path.join(__dirname, "node_modules")));
app.use("/assets", express.static(path.join(__dirname, "assets")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "src/index.html"));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
