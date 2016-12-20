var MainController = function(userService, exerciseService){

    var mc = this;
    userService.showUserName(mc);

    // Controls the visibility of the topics and exercise sections
    mc.showStatus = {};
    mc.showStatus.exercises = true;
    mc.showStatus.attempts = false;
    mc.showStatus.learningResource = false;
    mc.showStatus.addFlashmarkButton = true;


    // Exercise attempts report data.
    mc.report = {};
    mc.report.attempts = [];

    // Every resource for a given user.
    mc.allResources = [];

    mc.viewAttemptsClick = function(){
        mc.showStatus.exercises = false;
        mc.showStatus.attempts = true;
        mc.showStatus.learningResource = false;
        mc.showStatus.addFlashmarkButton = false;

        var cbSuccess = function(res){
            mc.report.attempts = res.data.history;
        };

        var cbFailure = function(res){
            alert("attempt to get the attempt report failed");
        }

        exerciseService.getAttemptsReport().then(cbSuccess, cbFailure);
    };

    mc.viewExercisesClick = function(){
        mc.showStatus.exercises = true;
        mc.showStatus.attempts = false;
        mc.showStatus.addFlashmarkButton = true;
        mc.showStatus.learningResource = false;
    };

    mc.viewLearningResourcesClick = function(){
        var getResourcesSuccess = function(res){
            var data = res.data;
            mc.allResources = res.data.resources;
        };

        var getResourcesFailure = function(res){
            alert("failed to access all learning resources for this user");
        };

        mc.showStatus.exercises = false;
        mc.showStatus.attempts = false;
        mc.showStatus.learningResource = true;
        mc.showStatus.addFlashmarkButton = false;
        var promise = exerciseService.getAllLearningResources();
        promise.then(getResourcesSuccess, getResourcesFailure);
    };

};

var flashmarkApp = function(){
    var d = {};
    d.restrict = "A";
    d.scope = {};
    d.templateUrl = "/static/main_app/flashmark_main.html";
    d.controller = "MainController";
    d.controllerAs = "mc";
    return d;
};
