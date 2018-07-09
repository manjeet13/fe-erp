//import dependencies

var router = require('express').Router({mergeParams: true});
router.get('/:module/:controller/:action',(req, res, next) => {
    console.log(req.params);
    var controller = "./fe-server/legislations/fe/clients/"+req.params.client+"/main/process/"+req.params.module+"/controllers/"+req.params.controller;
    var controller_class = require(controller);
    console.log(controller);
    var controllerObj = new controller_class();
    var action = req.params.action;
    res.send(controllerObj[action]());
});

module.exports = router;