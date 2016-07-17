// The main application controller
// Main controller is a container for shared state variables.



(function(){


// Convert a number score value into a word (good, okay, bad) in the attempts report
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


// Handles the adding events for when users add exercises, click on them, and push buttons that
// rate how they felt they did.
var ExerciseController = function(exerciseService){

    var ec = this;

    // The currently "active" variables used to help set up lists, add new info, ect.
    ec.activeObject = {};
    ec.activeObject.exercise = {"id": 0, "question": "blank question", "answer": "blank answer"};

    // Item lists to display on different parts of the page
    ec.dataList = {};
    ec.dataList.exercises = [];
    ec.dataList.resources = [];

    ec.newinfo = {};
    ec.newinfo.question = "";
    ec.newinfo.answer = "";
    ec.newinfo.caption = "";
    ec.newinfo.url = "";

    ec.charsleft = {};
    ec.charsleft.question = "";
    ec.charsleft.answer = "";
    ec.charsleft.caption = "";
    ec.charsleft.url = "";

    var getExercisesSuccess = function(res){
         ec.dataList.exercises = res.data.exercises;
    };

    var getExercisesFailure = function(res){
    };


    var promise = exerciseService.getExercises();
    promise.then(getExercisesSuccess, getExercisesFailure);


    // add an exercise and update exercise display.  Clear out the exercise addition form and show the latest questions
    // when done.
    ec.addExerciseClick = function(newQuestion, newAnswer){

        var successCallback = function(res){
            var promise = exerciseService.getExercises();
            promise.then(getExercisesSuccess, getExercisesFailure);
        };

        var failureCallback = function(res){};

        var addExercisePromise = exerciseService.addExercise(newQuestion, newAnswer);
        addExercisePromise.then(successCallback, failureCallback);
        ec.newinfo.question = "";
        ec.newinfo.answer = "";
        $("#addExerciseModal").modal("hide");
    };


    // Make sure the right questions show up in the question box.
    ec.exerciseClick = function(exercise){
        ec.activeObject.exercise = exercise;
        $("#questionModal").modal();
    };


    // When user clicks "show answer" in the question box, show the answer in a display they can rate themselves on.
    ec.showAnswerClick = function(){
        $("#questionModal").modal("hide");
        $("#questionAnswerModal").modal();
    };


    // Handle a user rating themselves.  Here, just send the rating to the server
    // and make the question answer box go away.
    ec.scoreClick = function(score){
        exerciseService.submitScore(ec.activeObject.exercise, score);
        $("#questionAnswerModal").modal("hide");
    };

    ec.deleteExerciseClick = function(exercise_id){
        var successCallback = function(res){
            var promise = exerciseService.getExercises();
            promise.then(getExercisesSuccess, getExercisesFailure);
        };

        var failureCallback = function(res){
            alert("Deletion attempt failed: " + res.data);
        };

        var deleteExercisePromise = exerciseService.deleteExercise(exercise_id);
        deleteExercisePromise.then(successCallback, failureCallback)
    };

    ec.resourceButtonClick = function(exercise){

        var successCallback = function(res){
            ec.dataList.resources = res.data.resources;
            $("#resourceListId").modal();
        };
        var failureCallback = function(res){};

        ec.activeObject.exercise = exercise;
        var promise = exerciseService.reviseLearningResourceList(exercise.id);
        promise.then(successCallback, failureCallback);

    };

    ec.resourceListToResourceModalClick = function(){
        $("#resourceListId").modal("hide");
        $("#addResourceModal").modal();
    };

    ec.addLearningResourceClick = function(new_cap, new_url){

        var successCallback = function(res){
            var getResourceSuccess = function(res){
                ec.dataList.resources = res.data.resources;
            };

            var promise = exerciseService.reviseLearningResourceList(ec.activeObject.exercise.id);
            promise.then(getResourceSuccess);
        };

        var failureCallback = function(res){
            alert("failure in adding the resource");
        };

        var promise = exerciseService.addLearningResource(new_cap, new_url, ec.activeObject.exercise.id);
        promise.then(successCallback, failureCallback);

        ec.newinfo.caption = "";
        ec.newinfo.url = "";
        $("#addResourceModal").modal("hide");

    };

    ec.deleteLearningResourceClick = function(resource_id){

        var success = function(res){
            var resourceSuccess = function(res){
                ec.dataList.resources = res.data.resources;
            };

            var promise = exerciseService.reviseLearningResourceList(ec.activeObject.exercise.id);
            promise.then(resourceSuccess);
        };

        var failure = function(res){
            alert("failure in deleting the resource");
        };

        var promise = exerciseService.deleteLearningResource(resource_id);
        promise.then(success, failure);
    };

    ec.updateCharsLeft = function(fieldName, charsLeftDisplay){
        var charsLeft = 140;
        var message = "";

        if(fieldName === "newQuestion"){
            charsLeft = 140 - ec.newinfo.question.length;
        }
        else if(fieldName === "newAnswer"){
            charsLeft = 140 - ec.newinfo.answer.length;
        }
        else if(fieldName === "new_caption_field"){
            charsLeft = 140 - ec.newinfo.caption.length;
        }
        else if(fieldName === "new_url_field"){
            charsLeft = 140 - ec.newinfo.url.length;
        }

        message = charsLeft + " characters left";

        if(charsLeftDisplay === "questionCharsLeft"){
            ec.charsleft.question = message;
        }

        else if(charsLeftDisplay === "answerCharsLeft"){
            ec.charsleft.answer = message;
        }

        else if(charsLeftDisplay === "captionCharsLeft"){
            ec.charsleft.caption = message;
        }

        else if(charsLeftDisplay === "urlCharsLeft"){
            ec.charsleft.url = message;
        }

    };

};


var exerciseDisplay = function(){
    var d = {};
    d.restrict = "E";
    d.scope = {
        show: "="
    };
    d.templateUrl = "exercise_list_display.html";
    d.controller = "ExerciseController";
    d.controllerAs = "ec";
    return d;
};



var NavbarController = function(userService, exerciseService){

    var nc = this;
    userService.showUserName(nc);

    nc.viewAttemptsClick = function(mainController){
        mainController.showStatus.exercises = false;
        mainController.showStatus.attempts = true;
        mainController.showStatus.addFlashmarkButton = false;

        var cbSuccess = function(res){
            mainController.report.attempts = res.data.history;
        };

        var cbFailure = function(res){
            alert("attempt to get the attempt report failed");
        }

        exerciseService.getAttemptsReport().then(cbSuccess, cbFailure);
    }

    nc.viewExercisesClick = function(mainController){
        mainController.showStatus.exercises = true;
        mainController.showStatus.attempts = false;
        mainController.showStatus.addFlashmarkButton = true;
    };

};

var attemptsReport = function(){
    var d = {};
    d.restrict = "E";
    d.scope = {
        attempts: "=",
        show: "="
    };

    d.templateUrl = "attempts_report.html"
    return d;
};


var MainController = function(userService, exerciseService){

    var mc = this;
    // Controls the visibility of the topics and exercise sections
    mc.showStatus = {};
    mc.showStatus.exercises = true;
    mc.showStatus.attempts = false;
    mc.showStatus.addFlashmarkButton = true;


    // Exercise attempts report data.
    mc.report = {};
    mc.report.attempts = [];

};

// Core Angular app initialization
angular.module("app", [])
    .controller("MainController", MainController)
    .controller("ExerciseController", ExerciseController)
    .controller("NavbarController", NavbarController)
    .service("userService", UserService)
    .service("exerciseService", ExerciseService)
    .filter("lmScoreWord", lmScoreWordFilter)
    .directive("exerciseDisplay", exerciseDisplay)
    .directive("attemptsReport", attemptsReport);
})();
