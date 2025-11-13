import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { PDFDocument, rgb } from "pdf-lib";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("pdf"), (req, res) => {
  res.json({ filename: req.file.filename });
});

app.post("/edit", async (req, res) => {
  const { filename, text, x = 50, y = 50 } = req.body;
  const filePath = path.join("uploads", filename);
  const pdfBytes = fs.readFileSync(filePath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const page = pdfDoc.getPages()[0];
  page.drawText(text, { x, y, size: 20, color: rgb(1, 0, 0) });
  const editedPdf = await pdfDoc.save();
  fs.writeFileSync(path.join("edited", filename + "-edited.pdf"), editedPdf);
  res.sendFile(path.resolve("edited", filename + "-edited.pdf"));
});

app.use("/files", express.static("uploads"));
app.use("/edited", express.static("edited"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Running on ${PORT}`));
