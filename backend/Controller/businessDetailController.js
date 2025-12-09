const BusinessDetailModel = require("../Model/businessDetailModel")

const businessDetails = async(req,res)=>{
    try {

            const userId = req.user.userId;   // From JWT or session after authentication
          const businessdata = new BusinessDetailModel({ ...req.body,userId:userId });
          await businessdata.save();
          res.json({ message: "Data Added successful" });
    } catch (error) {
  console.error("Error saving Data:", error);
    res.status(500).send({ success: false, message: "Server error" });
    }
}

module.exports = {businessDetails}