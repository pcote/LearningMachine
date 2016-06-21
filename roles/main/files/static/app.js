// The main application controller
// Main controller is a container for shared state variables.

// The sub-controllers. (UserController, AttemptReportController, ect) specialize in different parts of
// the application functionality.


(function(){
var MainController = function($scope, $rootScope, userService, exerciseService){
    // The currently "active" variables used to help set up lists, add new info, ect.
    $rootScope.activeObject = {};
    $rootScope.activeObject.exercise = {"id": 0, "question": "blank question", "answer": "blank answer"};

    // Controls the visibility of the topics and exercise sections
    this.showStatus = {};
    this.showStatus.exercises = true;
    this.showStatus.attempts = false;

    // Item lists to display on different parts of the page
    $scope.dataList = {};
    $scope.dataList.exercises = [];
    $scope.dataList.resources = [];

    // Exercise attempts report data.
    this.report = {};
    this.report.attempts = [];

};


// Initial setup upon the user having logged in and arrived at the main page.
var UserController = function(userService){
    userService.showUserName(this);
};


// Handle mouse event to ensure the user gets their attempts report to display.
var AttemptsReportController = function($scope, exerciseService){
    $scope.viewAttemptsClick = function(mainController){
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
var ExerciseController = function($scope, $rootScope, exerciseService, $http){


    var getExercisesSuccess = function(res){
         $scope.dataList.exercises = res.data.exercises;
    };

    var getExercisesFailure = function(res){
    };


    var promise = exerciseService.getExercises();
    promise.then(getExercisesSuccess, getExercisesFailure);


    // add an exercise and update exercise display.  Clear out the exercise addition form and show the latest questions
    // when done.
    $scope.addExerciseClick = function(newQuestion, newAnswer){

        var successCallback = function(res){
            var promise = exerciseService.getExercises();
            promise.then(getExercisesSuccess, getExercisesFailure);
        };

        var failureCallback = function(res){};

        var addExercisePromise = exerciseService.addExercise(newQuestion, newAnswer);
        addExercisePromise.then(successCallback, failureCallback);

        $scope.newQuestion = "";
        $scope.newAnswer = "";
        $("#addExerciseModal").modal("hide");
    };


    // Make sure the right questions show up in the question box.
    $scope.exerciseClick = function(exercise){
        $rootScope.activeObject.exercise = exercise;
        $("#questionModal").modal();
    };

    // Navigate to the exercises page
    $scope.viewExercisesClick = function(mainController){
        mainController.showStatus.exercises = true;
        mainController.showStatus.attempts = false;
        var promise = exerciseService.getExercises();
        promise.then(getExercisesSuccess, getExercisesFailure);
    };


    // When user clicks "show answer" in the question box, show the answer in a display they can rate themselves on.
    $scope.showAnswerClick = function(){
        $("#questionModal").modal("hide");
        $("#questionAnswerModal").modal();
    };


    // Handle a user rating themselves.  Here, just send the rating to the server
    // and make the question answer box go away.
    $scope.scoreClick = function(score){
        exerciseService.submitScore($rootScope.activeObject.exercise, score);
        $("#questionAnswerModal").modal("hide");
    };

    $scope.deleteExerciseClick = function(exercise_id){
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

    $scope.resourceButtonClick = function(exercise){

        var successCallback = function(res){
            $scope.dataList.resources = res.data.resources;
            $("#resourceListId").modal();
        };
        var failureCallback = function(res){};

        $scope.activeObject.exercise = exercise;
        var promise = exerciseService.reviseLearningResourceList(exercise.id);
        promise.then(successCallback, failureCallback);

    };

    $scope.resourceListToResourceModalClick = function(){
        $("#resourceListId").modal("hide");
        $("#addResourceModal").modal();
    };

    $scope.addLearningResourceClick = function(new_cap, new_url){

        var successCallback = function(res){
            var url = "/resourcesforexercise/" + $rootScope.activeObject.exercise.id;

            $http.get(url).then(function(res){
                $scope.dataList.resources = res.data.resources;
            }, function(res){})
        };

        var failureCallback = function(res){
            alert("failure in adding the resource");
        };

        var promise = exerciseService.addLearningResource(new_cap, new_url, $rootScope.activeObject.exercise.id);
        promise.then(successCallback, failureCallback);

        $scope.new_caption_field = "";
        $scope.new_url_field = "";
        $("#addResourceModal").modal("hide");

    };

    $scope.deleteLearningResourceClick = function(resource_id){

        var success = function(res){
            var url = "/resourcesforexercise/" + $rootScope.activeObject.exercise.id;
            $http.get(url).then(function(res){
                $scope.dataList.resources = res.data.resources;
            }, function(res){})
        };

        var failure = function(res){
            alert("failure in deleting the resource");
        };

        var promise = exerciseService.deleteLearningResource(resource_id);
        promise.then(success, failure);
    };

    $scope.updateCharsLeft = function(fieldName, charsLeftDisplay){
        var charsLeft = 140 - $scope[fieldName].length;
        $scope[charsLeftDisplay] = charsLeft + " characters left.";
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
