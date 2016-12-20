
var learningResourceDisplay = function(){
    var d = {};
    d.scope = {
        show: "=show",
        resources: "=resources"
    };

    //d.template = " <h1>arg show: {{show}} controller show: {{lrc.testShow}}</h1></div>";
    d.templateUrl = "/static/resources_display/resource_list_display.html";
    return d;
};
