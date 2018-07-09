//var path = require('path');

const fe_hrt_emp_info_t = require(process.env.L0+'/legislations/fe/clients/fe/main/process/default/controllers/emp.js');

var express = require('express');
var router = express.Router();

var fe_hrt_emp_info_t_obj = new fe_hrt_emp_info_t();


router.get('/:id',fe_hrt_emp_info_t_obj.empDetails);
router.get('/saas',fe_hrt_emp_info_t_obj.testFunction);

module.exports = router;  