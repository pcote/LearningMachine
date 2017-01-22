// Directive component for handling the display of all learning resources.
var learningResourceDisplay = function(){
    var d = {};
    d.scope = {
        show: "=show",
        resources: "=resources"
    };

    d.templateUrl = "/static/resources_display/resources_display.html";
    return d;
};
