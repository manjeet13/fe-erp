const LgEmpDetails = require(process.env.L2Process+'default/controllers/fe_hrt_emp_info_t.js');

//console.log('sdsadasadsdasadsadsa'+   process.env.L2Process);
module.exports = class EmpDetails extends LgEmpDetails{
    constructor(){
        super();
    }
    testFunction(req,res,done){
        res.send('L3 FUNCTION WORKING');
    }

     empDetails(req,res,done){
         return 'L3 EMPDETAILS FUNCTION WORKING';
     }
    
 }

