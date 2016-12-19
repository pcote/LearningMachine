var LearningResourceController = function(){
    var lrc = this;
};

var learningResourceDisplay = function(){
    var d = {};
    d.scope = {
        show: "=show"
    };

    //d.template = " <h1>arg show: {{show}} controller show: {{lrc.testShow}}</h1></div>";
    d.templateUrl = "/static/resources_display/resource_list_display.html";
    d.controller = "LearningResourceController";
    d.controllerAs = "lrc";
    return d;
};