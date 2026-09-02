const mockReports = [];

// GET /api/v1/reports
// retrieve all hazard reports
exports.getReports =(req,res)=>{
    return res.status(200).json({success:true, data:mockReports});
};

//post /api/v1/reports
// Hazard Report Submission Route
exports.submitReport =(req,res)=>{
        const { category, latitude, longitude, description}=req.body;

    if(!category || !latitude || !longitude || !description){
        return  res.status(400).json({
     success:false, error:'Missing required fields :category , latitude, longitude, description'});
    }
      // temporary object
    const  newReport ={
        id:Date.now(),
        category,
        latitude:parseFloat(latitude),
        longitude:parseFloat(longitude),
        description:description ,
        status:'active'
       
    } ;
    mockReports.push(newReport);
    return res.status(201).json({success:true, data:newReport});
    
}