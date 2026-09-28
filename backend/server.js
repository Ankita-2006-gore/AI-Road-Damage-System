require("dotenv").config();
const db = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./middleware/authMiddleware");
const adminMiddleware = require("./middleware/adminMiddleware");
const upload = require("./uploadMiddleware");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());


// ==========================================
// HOME ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.json({
    message: "RoadGuard AI Backend is running!"
  });
});


// ==========================================
// DATABASE TEST
// ==========================================

app.get("/api/test-db", (req, res) => {
  db.query("SELECT 1 AS result", (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Database test failed",
        error: err.message
      });
    }

    res.json({
      message: "Database is working!",
      result: results[0].result
    });
  });
});


// ==========================================
// USER REGISTRATION
// ==========================================

app.post("/api/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "All fields are required"
    });
  }

  const sql = `
    INSERT INTO users (name, email, password)
    VALUES (?, ?, ?)
  `;

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.query(
    sql,
    [name, email, hashedPassword],
    (err, result) => {

      if (err) {

        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({
            message: "Email already registered"
          });
        }

        return res.status(500).json({
          message: "Registration failed",
          error: err.message
        });
      }

      res.status(201).json({
        message: "User registered successfully!",
        userId: result.insertId
      });
    }
  );
});


// ==========================================
// USER LOGIN
// ==========================================

app.post("/api/login", (req, res) => {

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required"
    });
  }

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], (err, results) => {

    if (err) {
      return res.status(500).json({
        message: "Login failed",
        error: err.message
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const user = results[0];

    const isPasswordCorrect = bcrypt.compareSync(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h"
      }
    );

    res.json({
      message: "Login successful!",
      token: token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  });
});


// ==========================================
// PROTECTED ROUTE
// ==========================================

app.get("/api/protected", authMiddleware, (req, res) => {

  res.json({
    message: "You accessed a protected route!",
    user: req.user
  });

});

// ==========================================
// GET USER REPORTS
// ==========================================

app.get("/api/reports", authMiddleware, (req, res) => {

  const sql = `
    SELECT
      id,
      image_path,
      damage_type,
      confidence,
      severity,
      latitude,
      longitude,
      description,
      status,
      created_at
    FROM reports
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [req.user.id], (err, results) => {

    if (err) {
      return res.status(500).json({
        message: "Failed to fetch reports",
        error: err.message
      });
    }

    res.json({
      reports: results
    });

  });
});

// ==========================================
// GET ALL REPORTS - ADMIN ONLY
// ==========================================

app.get(
  "/api/admin/reports",
  authMiddleware,
  adminMiddleware,
  (req, res) => {

    const sql = `
      SELECT
        reports.id,
        reports.user_id,
        users.name,
        users.email,
        reports.image_path,
        reports.damage_type,
        reports.confidence,
        reports.severity,
        reports.latitude,
        reports.longitude,
        reports.description,
        reports.status,
        reports.created_at
      FROM reports
      JOIN users
        ON reports.user_id = users.id
      ORDER BY reports.created_at DESC
    `;

    db.query(sql, (err, results) => {

      if (err) {
        return res.status(500).json({
          message: "Failed to fetch admin reports",
          error: err.message
        });
      }

      res.json({
        reports: results
      });

    });
  }
);

// ==========================================
// UPDATE REPORT STATUS - ADMIN ONLY
// ==========================================

app.put(
  "/api/admin/reports/:id/status",
  authMiddleware,
  adminMiddleware,
  (req, res) => {

    const { status } = req.body;
    const reportId = req.params.id;

    const allowedStatuses = [
      "New",
      "Acknowledged",
      "In Repair",
      "Completed"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status"
      });
    }

    const sql = `
      UPDATE reports
      SET status = ?
      WHERE id = ?
    `;

    db.query(
      sql,
      [status, reportId],
      (err, result) => {

        if (err) {
          return res.status(500).json({
            message: "Failed to update report status",
            error: err.message
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            message: "Report not found"
          });
        }

        res.json({
          message: "Report status updated successfully!",
          reportId: reportId,
          status: status
        });

      }
    );
  }
);
// ==========================================
// UPLOAD IMAGE + AI DETECTION + SAVE REPORT
// ==========================================

app.post(
  "/api/upload",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {

    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded"
      });
    }

    try {

      // ------------------------------------------
      // STEP 1: Create FormData
      // ------------------------------------------

      const form = new FormData();

      form.append(
        "file",
        fs.createReadStream(req.file.path)
      );


      // ------------------------------------------
      // STEP 2: Send image to FastAPI AI service
      // ------------------------------------------

      const aiResponse = await axios.post(
        "http://127.0.0.1:8000/predict",
        form,
        {
          headers: {
            ...form.getHeaders()
          }
        }
      );


      // ------------------------------------------
      // STEP 3: Get AI detection results
      // ------------------------------------------

      const detections = aiResponse.data.detections;


      // ------------------------------------------
      // STEP 4: Get first detected damage
      // ------------------------------------------

      const firstDetection = detections[0];


      let damageType = "No damage";
      let confidence = 0;


      if (firstDetection) {

        damageType = firstDetection.damage_type;
        confidence = firstDetection.confidence;

      }


      // ------------------------------------------
      // STEP 5: Calculate temporary severity
      // ------------------------------------------

      let severity = "Low";

      if (confidence >= 70) {

        severity = "High";

      } else if (confidence >= 40) {

        severity = "Medium";

      }


      // ------------------------------------------
      // STEP 6: Get location + description
      // ------------------------------------------

      const {
        latitude,
        longitude,
        description
      } = req.body;


      // ------------------------------------------
      // STEP 7: Save report in MySQL
      // ------------------------------------------

      const sql = `
        INSERT INTO reports
        (
          user_id,
          image_path,
          damage_type,
          confidence,
          severity,
          latitude,
          longitude,
          description
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;


      const values = [

        req.user.id,

        req.file.path,

        damageType,

        confidence,

        severity,

        latitude || null,

        longitude || null,

        description || null

      ];


      db.query(
        sql,
        values,
        (err, result) => {

          if (err) {

            return res.status(500).json({
              message: "Failed to create report",
              error: err.message
            });

          }


          // ------------------------------------------
          // STEP 8: Send final response
          // ------------------------------------------

          res.status(201).json({

            message: "Report created successfully!",

            reportId: result.insertId,

            detection: {

              damage_type: damageType,

              confidence: confidence,

              severity: severity

            }

          });

        }
      );

    } catch (error) {

      console.error(
        "AI service error:",
        error.message
      );


      return res.status(500).json({

        message: "AI detection failed",

        error: error.message

      });

    }

  }
);


// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {

  console.log(
    `Server running on http://localhost:${PORT}`
  );

});