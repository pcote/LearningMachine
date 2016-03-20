// The main application controller
// Main controller is a container for shared state variables.

// The sub-controllers. (UserController, AttemptReportController, ect) specialize in different parts of
// the application functionality.


(function(){
var controller = function($scope, $rootScope, userService, exerciseService, learningResourceService){
    // The currently "active" variables used to help set up lists, add new info, ect.
    $rootScope.activeObject = {}
    $rootScope.activeObject.exercise = {"id": 0, "question": "blank question", "answer": "blank answer"}
    $rootScope.activeObject.user = {}

    // Controls the visibility of the topics and exercise sections
    $scope.showStatus = {}
    $scope.showStatus.exercises = true
    $scope.showStatus.attempts = false

    // Item lists to display on different parts of the page
    $scope.dataList = {}
    $scope.dataList.exercises = []
    $scope.dataList.resources = []

    // Exercise attempts report data.
    $scope.report = {}
    $scope.report.attempts = []

}


// Initial setup upon the user having logged in and arrived at the main page.
var UserController = function($scope, userService){
    userService.showUserName($scope)
}


// Handle mouse event to ensure the user gets their attempts report to display.
var AttemptsReportController = function($scope, exerciseService){
    $scope.viewAttemptsClick = function(){
        exerciseService.getAttemptsReport($scope)
    }
}




// Handles the adding events for when users add exercises, click on them, and push buttons that
// rate how they felt they did.
var ExerciseController = function($scope, $rootScope, exerciseService){

    // exercise list sentinel used to trigger refreshes of exercise list.
    $scope.trigger = true

    $scope.$watch(function(){
        return $scope.trigger
    }, function(newVal, oldVal){
        if(newVal !== oldVal){
            exerciseService.setupExerciseDisplay($scope)
        }
    })

    exerciseService.setupExerciseDisplay($scope)


    // add an exercise and update exercise display.  Clear out the exercise addition form and show the latest questions
    // when done.
    $scope.addExerciseClick = function(newQuestion, newAnswer){
        exerciseService.addExercise($scope, newQuestion, newAnswer)
        $scope.newQuestion = ""
        $scope.newAnswer = ""
        $("#addExerciseModal").modal("hide")
    }


    // Make sure the right questions show up in the question box.
    $scope.exerciseClick = function(exercise){
        $rootScope.activeObject.exercise = exercise
        $("#questionModal").modal()
    }

    // Navigate to the exercises page
    $scope.viewExercisesClick = function(){
        $scope.showStatus.exercises = true
        $scope.showStatus.attempts = false
        exerciseService.setupExerciseDisplay($scope)
    }


    // When user clicks "show answer" in the question box, show the answer in a display they can rate themselves on.
    $scope.showAnswerClick = function(){
        $("#questionModal").modal("hide")
        $("#questionAnswerModal").modal()
    }


    // Handle a user rating themselves.  Here, just send the rating to the server
    // and make the question answer box go away.
    $scope.scoreClick = function(score){
        exerciseService.submitScore($rootScope.activeObject.exercise, score)
        $("#questionAnswerModal").modal("hide")
    }

    $scope.deleteExerciseClick = function(exercise_id){
        exerciseService.deleteExercise($scope, exercise_id)
    }

    $scope.updateArrowClick = function(exercise_id){
        alert("update arrow click stub.  exercise: " + exercise_id)
        exerciseService.reviseLearningResourceList($scope, exercise_id)
    }

    $scope.exerciseToResourceModalClick = function(){
        $("#questionModal").modal("hide")
        $("#addResourceModal").modal()
    }

}

var LearningResourceController = function($scope, $rootScope, learningResourceService){

    learningResourceService.setupLearningResourceDisplay($scope)

    $scope.resource_trigger = true

    var resource_trigger_watcher = function(){
        return $scope.resource_trigger
    }

    var resource_trigger_listener = function(new_val, old_val){
            learningResourceService.setupLearningResourceDisplay($scope)
    }

    $scope.$watch(resource_trigger_watcher, resource_trigger_listener)

    $scope.addLearningResourceClick = function(new_cap, new_url){
        learningResourceService.addLearningResource($scope, new_cap, new_url, $rootScope.activeObject.exercise.id)
        $scope.new_caption_field = ""
        $scope.new_url_field = ""
        $("#addResourceModal").modal("hide")

    }



    $scope.deleteLearningResourceClick = function(resource_id){
        learningResourceService.deleteLearningResource($scope, resource_id)
    }
}




// Convert a number score value into a word (good, okay, bad) in the attempts report
var lmScoreWordFilter = function(){
    var filter = function(score){
        if(score == 1 ){
            return "Bad"
        }
        else if(score == 2){
            return "Okay"
        }
        else if(score == 3){
            return "Good"
        }
        else{
            return "ERROR: Bad score argument"
        }
    }

    return filter
}


// Core Angular app initialization
angular.module("app", [])
    .controller("controller", controller)
    .controller("ExerciseController", ExerciseController)
    .controller("AttemptsReportController", AttemptsReportController)
    .controller("UserController", UserController)
    .controller("LearningResourceController", LearningResourceController)
    .service("userService", UserService)
    .service("exerciseService", ExerciseService)
    .service("learningResourceService", LearningResourceService)
    .filter("lmScoreWord", lmScoreWordFilter)
})()