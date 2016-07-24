var lmScoreWordFilter = function(){
    var filter = function(score){
        if(score == 1 ){
            return "Bad";
        }
        else if(score == 2){
            return "Okay";
        }
        else if(score == 3){
            return "Good";
        }
        else{
            return "ERROR: Bad score argument";
        }
    };

    return filter;
};

var attemptsReport = function(){
    var d = {};
    d.restrict = "E";
    d.scope = {
        attempts: "=",
        show: "="
    };

    d.templateUrl = "/static/attempts_report/attempts_report.html"
    return d;
};