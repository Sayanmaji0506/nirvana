const axios = require('axios');

//post request to the AI model
//post /api/v1/routes/evaluate

exports.evaluateRoute = async(req, res)=>{
    const { origin, destination,vehicleType}=req.body;

    if(!origin || !destination ){
        return res.status(400).json({success:false, error:'Missing required fields : origin, destination are mandatory'});
    }
    try{
        // send http request to python fastapi ai services via Axios
        const aiResponds = await axios.post('http://localhost:8000/api/v1/predict', { origin, destination, vehicle_type:vehicleType || 'truck '},{timeout:4000}); 

        //return AI response to the client (app)
        return res.status(200).json({success:true, data:aiResponds.data});
    } catch (error) {
        console.error('AI services failed to respond data', error.message);
        return res.status(500).json({success:true, isFallback:true, 
            evalution:{
               riskscore:0.2,
               status:'Low Risk',
               Warnings:[ 'AI Engine is currently unavailable, please try again later' ]

            }
        });
    }
};