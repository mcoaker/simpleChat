
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { 
  	"pageTitle" : "Pacific Peak Chat v0.1", 
  	"mainTitle" : "Pacific Peak Chat", 
  });
};