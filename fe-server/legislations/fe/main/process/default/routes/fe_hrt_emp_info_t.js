//var path = require('path');

//const fe_hrm_emp_info_t = require(process.env.L1Process+'/default/routes/fe_hrm_emp_info_t.js');

var express = require('express');
var router = express.Router();

//router.get('/:id',fe_hrm_emp_info_t_obj.empDetails);
router.use('/',require(process.env.L1Process+'/default/routes/fe_hrt_emp_info_t.js'));

module.exports = router;