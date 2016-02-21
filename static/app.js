// The main application controller
// Main controller is a container for shared state variables.

// The sub-controllers. (UserController, AttemptReportController, ect) specialize in different parts of
// the application functionality.


(function(){
var controller = function($scope, $rootScope, categoryService, userService, exerciseService){
    // The currently "active" variables used to help set up lists, add new info, ect.
    $rootScope.activeObject = {}
    $rootScope.activeObject.tag = {"name":"Untagged", "id": 0}
    $rootScope.activeObject.topic = {}
    $rootScope.activeObject.exercise = {"id": 0, "question": "blank question", "answer": "blank answer"}
    $rootScope.activeObject.user = {}

    // Controls the visibility of the topics and exercise sections
    $scope.showStatus = {}
    $scope.showStatus.topics = false
    $scope.showStatus.exercises = true
    $scope.showStatus.attempts = false

    // Item lists to display on different parts of the page
    $scope.dataList = {}
    $scope.dataList.topics = []
    $scope.dataList.tags = []
    $scope.dataList.exercises = []

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


// Makes sure tag lists show up and that topics display when a tag gets clicked on.
var TagController = function($scope, $rootScope, categoryService){

    // display of tags
    categoryService.refreshTagList($scope)

    // response to clicks on tags
    // Mouse click handling event functions
    $scope.tag_click = function(tag_id){
        categoryService.updateTopicsList($scope, tag_id)
        $scope.showStatus.topics = true
        $scope.showStatus.exercises = false
        $scope.showStatus.attempts = false
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
        exerciseService.addExercise($scope, newQuestion, newAnswer, $rootScope.activeObject.topic.id)
        $scope.newQuestion = ""
        $scope.newAnswer = ""
    }


    // Make sure the right questions show up in the question box.
    $scope.exerciseClick = function(exercise){
        $rootScope.activeObject.exercise = exercise
        $("#questionModal").modal()
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

}


// Handlers concerning adding new topics and handling clicks on existing topics so that the right exercises show up.
var TopicController = function($scope, categoryService, exerciseService){


    // Adds a new topic based on the add topic form, clears form fields, and updates the tags.
    $scope.add_topic_click = function(){
        categoryService.addTopicInfo($scope, $scope.new_topic_name, $scope.new_topic_tags)
        $scope.new_topic_name = ""
        $scope.new_topic_tags = ""
    }

    // When a user clicks a topic, get the right exercises related to it to show up.
    $scope.topic_click = function(topicId){
        exerciseService.setupExerciseDisplay($scope)
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
    .controller("TopicController", TopicController)
    .controller("ExerciseController", ExerciseController)
    .controller("TagController", TagController)
    .controller("AttemptsReportController", AttemptsReportController)
    .controller("UserController", UserController)
    .service("categoryService", CategoryService)
    .service("userService", UserService)
    .service("exerciseService", ExerciseService)
    .filter("lmScoreWord", lmScoreWordFilter)
})()