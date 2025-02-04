// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const multer = require("multer");

// const app = express(); // ✅ Ye line missing thi (app ko define kar diya)
// const PORT = process.env.PORT || 5000;

// // ✅ CORS Enable Karo
// app.use(cors());
// app.use(express.json());

// // ✅ Multer Setup (File Upload)
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// // ✅ Aadhaar Upload API Route
// app.post("/upload-aadhaar", upload.single("file"), (req, res) => {
//   console.log("Request received on /upload-aadhaar");

//   if (!req.file) {
//     console.error("No file uploaded!");
//     return res.status(400).json({ error: "No file uploaded!" });
//   }

//   console.log("File received:", req.file.originalname);

//   // ✅ Dummy Data (Check Karo Ki Extracted Texts Exist Karta Hai Ya Nahi)
//   const extracted_texts = [
//     {
//       texts: {
//         roi_1: "1234-5678-9012",
//         roi_2: "John Doe",
//         roi_3: "01-01-1990",
//         roi_4: "Male",
//         roi_5: "9876543210",
//         roi_6: "123 Street, City, Country",
//       },
//     },
//   ];

//   console.log("Sending Response:", { message: "Success", extracted_texts });

//   res.json({ message: "Aadhaar uploaded successfully!", extracted_texts });
// });

// // ✅ Server Start
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse"); // ✅ PDF Parsing Library

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Enable CORS & JSON Parsing
app.use(cors());
app.use(express.json());

// ✅ Multer Setup (File Upload)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ✅ Aadhaar Upload API Route
app.post("/upload-aadhaar", upload.single("file"), async (req, res) => {
  console.log("📩 Request received on /upload-aadhaar");

  if (!req.file) {
    console.error("❌ No file uploaded!");
    return res.status(400).json({ error: "No file uploaded!" });
  }

  console.log("📂 File received:", req.file.originalname);

  try {
    // ✅ Extract Text from PDF
    const pdfText = await pdfParse(req.file.buffer);
    const extractedText = pdfText.text;
    console.log("📜 Extracted PDF Text:", extractedText);

    // ✅ Extract Aadhaar Details Dynamically
    const extractedDetails = parseAadhaarDetails(extractedText);

    if (!extractedDetails.aadharNumber) {
      return res
        .status(400)
        .json({ error: "Aadhaar details not found in PDF!" });
    }

    console.log("✅ Aadhaar Details Extracted:", extractedDetails);

    res.json({ message: "Aadhaar uploaded successfully!", extractedDetails });
  } catch (error) {
    console.error("❌ Error processing Aadhaar PDF:", error);
    res.status(500).json({ error: "Failed to process Aadhaar PDF!" });
  }
});

// ✅ Function to Extract Aadhaar Details from PDF Text
function parseAadhaarDetails(text) {
  const aadharRegex = /(\d{4}-\d{4}-\d{4})/; // Aadhaar Number Format: XXXX-XXXX-XXXX
  const dobRegex = /(\d{2}-\d{2}-\d{4})/; // DOB Format: DD-MM-YYYY
  const phoneRegex = /(\d{10})/; // 10-Digit Mobile Number

  const aadharMatch = text.match(aadharRegex);
  const dobMatch = text.match(dobRegex);
  const phoneMatch = text.match(phoneRegex);

  // **Extract Name** (Find first occurrence of capital letters, assuming it's the name)
  const nameMatch = text.match(/[A-Z][a-z]+ [A-Z][a-z]+/);

  return {
    aadharNumber: aadharMatch ? aadharMatch[1] : null,
    name: nameMatch ? nameMatch[0] : "Unknown",
    dateOfBirth: dobMatch ? dobMatch[1] : "Not Found",
    phoneNumber: phoneMatch ? phoneMatch[1] : "Not Found",
  };
}

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
