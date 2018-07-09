var models = require(process.env.L0+'/legislations/fe/clients/fe/main/process/default/models');

module.exports = class FeEmpDetails{

    constructor(){ }

    empDetails(req,res,done){
        var empId = req.params.id;
        models.EmpInfoModel.findAll({
            subQuery: false,
            //attributes: [['attribute11', 'Employee No'],['attribute4','Employee Name']],
            where: {
                attribute1: empId
            },
            required: true,
            // include:[
            //     {           
            //         model: models.fe_hrt_emp_job_t,
            //         attributes:['attribute1'],
            //         required: true,
            //         include:[
            //             {
            //                 model: models.fe_hrm_designation_ff_m,
            //                 attributes:[['attribute2','Designation Name']],
            //                 required:true
            //             },
            //             
            //                 model: models.fe_hrm_business_unit_m,
            //                 attributes:[['attribute2','Business Unit Name']],
            //                 required:false
            //             },
            //             {
            //                 model: models.fe_hrm_division_m,
            //                 attributes:[['attribute2','Division Name']],
            //                 required:true
            //             },
            //             {
            //                 model: models.fe_hrm_location_m,
            //                 attributes:[['attribute4','Location Name']],
            //                 required:true
            //             },
            //             {
            //                 model: models.fe_hrm_department_m,
            //                 attributes:[['attribute2','Department Name']],
            //                 required:true
            //             },
            //             {
            //                 model: models.fe_pym_pay_group_m,
            //                 attributes:[['attribute2','Pay Group Name']],
            //                 required:true
            //             },
            //         ]
                    
            //     }
            // ],
          }).then(function(empData){
              res.send(JSON.stringify(empData));
            }).catch(function(err){
                console.log(err);
                res.send(err);
            })
    
    }
}