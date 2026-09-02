const express = require('express');
const cors = require('cors');
 
const app = express();
app.use(cors());
const aiRoutes = require('./routes/aiRoutes');
const reportRoutes = require("./routes/reportRoute");

app.use(express.json());

app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/routes', aiRoutes);



app.get("/api/v1/health", (req,res)=>{
    res.status(200).json({status:"success", message:"Backend server is live now"});

});

// 404 handler for undefined routes
app.use((req, res) => {
    return res.status(404).json({ success: false, error: `Cannot ${req.method} ${req.originalUrl} -Endpoint not found` });
});

// Global error handler
app.use((err, req, res, next)=>{
    console.error('Server Error:', err.message);

    if(err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ success: false, error: 'Invalid JSON payload' });
    }   
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
});

const port = 3000;
app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`);
});