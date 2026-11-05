const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

// CHECK SERVER AND DATABASE
app.get("/api/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");
        res.json({ message: "Server and database connected" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DASHBOARD COUNTS
app.get("/api/dashboard", async (req, res) => {
    try {
        const [[residents]] = await pool.query(
            "SELECT COUNT(*) AS totalResidents FROM residents"
        );

        const [[visitors]] = await pool.query(
            "SELECT COUNT(*) AS totalVisitors FROM visitors"
        );

        const [[visits]] = await pool.query(
            "SELECT COUNT(*) AS totalVisits FROM visits"
        );

        const [[active]] = await pool.query(
            "SELECT COUNT(*) AS activeVisitors FROM visits WHERE status='IN'"
        );

        res.json({
            totalResidents: residents.totalResidents,
            totalVisitors: visitors.totalVisitors,
            totalVisits: visits.totalVisits,
            activeVisitors: active.activeVisitors
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET ALL RESIDENTS
app.get("/api/residents", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM residents ORDER BY resident_id"
        );

        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET ALL VISITOR RECORDS
app.get("/api/visits", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                v.visit_id,
                v.visitor_id,
                v.resident_id,
                vi.name AS visitor_name,
                vi.phone AS visitor_phone,
                vi.vehicle_no,
                vi.purpose,
                r.name AS resident_name,
                r.flat_no,
                v.entry_time,
                v.exit_time,
                v.status
            FROM visits v
            JOIN visitors vi
                ON v.visitor_id = vi.visitor_id
            JOIN residents r
                ON v.resident_id = r.resident_id
            ORDER BY v.visit_id DESC
        `);

        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// REGISTER NEW VISITOR
app.post("/api/visits", async (req, res) => {
    const {
        name,
        phone,
        vehicle_no,
        purpose,
        resident_id
    } = req.body;

    if (!name || !phone || !purpose || !resident_id) {
        return res.status(400).json({
            error: "Please fill all required fields"
        });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [visitor] = await connection.query(
            `INSERT INTO visitors
            (name, phone, vehicle_no, purpose)
            VALUES (?, ?, ?, ?)`,
            [name, phone, vehicle_no || null, purpose]
        );

        const [visit] = await connection.query(
            `INSERT INTO visits
            (resident_id, visitor_id, entry_time, status)
            VALUES (?, ?, NOW(), 'IN')`,
            [resident_id, visitor.insertId]
        );

        await connection.commit();

        res.status(201).json({
            message: "Visitor registered successfully",
            visit_id: visit.insertId
        });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

// CHECKOUT VISITOR
app.put("/api/visits/:id/checkout", async (req, res) => {
    try {
        const [result] = await pool.query(
            `UPDATE visits
             SET exit_time = NOW(), status = 'OUT'
             WHERE visit_id = ? AND status = 'IN'`,
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Active visit not found"
            });
        }

        res.json({
            message: "Visitor checked out successfully"
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// START SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
