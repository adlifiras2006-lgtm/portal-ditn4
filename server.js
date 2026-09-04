const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Sambungan ke Database Cloud Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 1. API Carian Profil (Contoh: Matrix 01DIT24F2042)
app.get('/api/search/:matrix_no', async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT full_name, matrix_no, course, institution, academic_year, image_url FROM students WHERE matrix_no = $1', 
            [req.params.matrix_no]
        );
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Nombor Matrik tidak dijumpai.' });
        res.json({ success: true, profile: rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. API Log Masuk Pelajar (adlifiras2006@gmail.com)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const { rows } = await pool.query(
            'SELECT * FROM students WHERE email = $1 AND password = $2', 
            [email, password]
        );
        if (rows.length === 0) return res.status(400).json({ success: false, message: 'Email atau kata laluan salah.' });
        
        res.json({
            success: true,
            student: {
                name: rows[0].full_name,
                matrix: rows[0].matrix_no,
                email: rows[0].email,
                phone: rows[0].phone,
                ic: rows[0].ic_number,
                course: rows[0].course,
                institution: rows[0].institution,
                image_url: rows[0].image_url
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. API Tukar Kata Laluan
app.put('/api/change-password', async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Sila isi semua ruangan!' });
    }

    try {
        const userCheck = await pool.query(
            'SELECT * FROM students WHERE email = $1 AND password = $2', 
            [email, oldPassword]
        );

        if (userCheck.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'Email atau kata laluan lama tidak sah!' });
        }

        await pool.query(
            'UPDATE students SET password = $1 WHERE email = $2',
            [newPassword, email]
        );

        res.json({ success: true, message: 'Kata laluan berjaya dikemas kini!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server DITN4 berjalan pada port ${PORT}`));