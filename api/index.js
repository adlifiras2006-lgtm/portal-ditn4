const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const app = express();

app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 1. API Carian Profil Awam
app.get('/api/search', async (req, res) => {
    const { no_matrik } = req.query;
    const { data, error } = await supabase
        .from('pelajar')
        .select('no_matrik, nama, jantina, kursus, institusi, gambar_url')
        .eq('no_matrik', no_matrik)
        .single();

    if (error || !data) return res.status(404).json({ message: 'Pelajar tidak dijumpai' });
    res.json(data);
});

// 2. API Log Masuk Pelajar
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const { data, error } = await supabase
        .from('pelajar')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

    if (error || !data) return res.status(401).json({ message: 'Email atau kata laluan salah' });
    res.json(data);
});

// 3. API Edit Profil Pelajar Kendiri
app.put('/api/student/update', async (req, res) => {
    const { no_matrik, jantina, gambar_url } = req.body;
    const { data, error } = await supabase
        .from('pelajar')
        .update({ jantina, gambar_url })
        .eq('no_matrik', no_matrik);

    if (error) return res.status(500).json({ message: 'Gagal mengemas kini profil' });
    res.json({ message: 'Berjaya dikemas kini' });
});

// 4. API Log Masuk Pensyarah
app.post('/api/lecturer/login', async (req, res) => {
    const { email, password } = req.body;
    // Pengesahan ringkas pensyarah
    if (email.includes('pensyarah') || email === 'lecturer@puo.edu.my') {
        return res.json({ message: 'Log masuk pensyarah berjaya' });
    }
    res.status(401).json({ message: 'Akaun pensyarah tidak sah' });
});

// 5. API Pensyarah: Ambil Semua Pelajar
app.get('/api/lecturer/students', async (req, res) => {
    const { data, error } = await supabase.from('pelajar').select('*');
    if (error) return res.status(500).json({ message: 'Ralat ambil data' });
    res.json(data);
});

// 6. API Pensyarah: Tambah Pelajar Baharu
app.post('/api/lecturer/add-student', async (req, res) => {
    const { data, error } = await supabase.from('pelajar').insert([req.body]);
    if (error) return res.status(500).json({ message: 'Gagal menambah pelajar' });
    res.json({ message: 'Pelajar berjaya ditambah' });
});

// 7. API Pensyarah: Padam Pelajar
app.delete('/api/lecturer/delete-student/:no_matrik', async (req, res) => {
    const { no_matrik } = req.params;
    const { error } = await supabase.from('pelajar').delete().eq('no_matrik', no_matrik);
    if (error) return res.status(500).json({ message: 'Gagal memadam pelajar' });
    res.json({ message: 'Pelajar dipadam' });
});

module.exports = app;