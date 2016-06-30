// The main application controller
// Main controller is a container for shared state variables.

// The sub-controllers. (UserController, AttemptReportController, ect) specialize in different parts of
// the application functionality.


(function(){
var MainController = function(userService, exerciseService){


    // Controls the visibility of the topics and exercise sections
    this.showStatus = {};
    this.showStatus.exercises = true;
    this.showStatus.attempts = false;


    // Exercise attempts report data.
    this.report = {};
    this.report.attempts = [];

};


// Initial setup upon the user having logged in and arrived at the main page.
var UserController = function(userService){
    userService.showUserName(this);
};


// Handle mouse event to ensure the user gets their attempts report to display.
var AttemptsReportController = function(exerciseService){
    this.viewAttemptsClick = function(mainController){
        mainController.showStatus.exercises = false;
        mainController.showStatus.attempts = true;

        var cbSuccess = function(res){
            mainController.report.attempts = res.data.history;
        };

        var cbFailure = function(res){
            alert("attempt to get the attempt report failed");
        }

        exerciseService.getAttemptsReport().then(cbSuccess, cbFailure);
    }
};




// Handles the adding events for when users add exercises, click on them, and push buttons that
// rate how they felt they did.
var ExerciseController = function(exerciseService, $http){

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
    }.bind(ec);

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
        $("#addExerciseModal").modal("hide");
    };


    // Make sure the right questions show up in the question box.
    ec.exerciseClick = function(exercise){
        ec.activeObject.exercise = exercise;
        $("#questionModal").modal();
    };

    // Navigate to the exercises page
    ec.viewExercisesClick = function(mainController){
        mainController.showStatus.exercises = true;
        mainController.showStatus.attempts = false;
        var promise = exerciseService.getExercises();
        promise.then(getExercisesSuccess, getExercisesFailure);
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
        }.bind(ec);
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
            }.bind(ec);

            var url = "/resourcesforexercise/" + ec.activeObject.exercise.id;
            var promise = $http.get(url);
            promise.then(getResourceSuccess);
        };

        var failureCallback = function(res){
            alert("failure in adding the resource");
        };

        var promise = exerciseService.addLearningResource(new_cap, new_url, ec.activeObject.exercise.id);
        promise.then(successCallback, failureCallback);

        $("#addResourceModal").modal("hide");

    };

    ec.deleteLearningResourceClick = function(resource_id){

        var success = function(res){
            var resourceSuccess = function(res){
                ec.dataList.resources = res.data.resources;
            }.bind(ec);

            var url = "/resourcesforexercise/" + ec.activeObject.exercise.id;
            var promise = $http.get(url)
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


// Core Angular app initialization
angular.module("app", [])
    .controller("MainController", MainController)
    .controller("ExerciseController", ExerciseController)
    .controller("AttemptsReportController", AttemptsReportController)
    .controller("UserController", UserController)
    .service("userService", UserService)
    .service("exerciseService", ExerciseService)
    .filter("lmScoreWord", lmScoreWordFilter)
})();
