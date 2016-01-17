
(function(){
var controller = function($scope, $rootScope, categoryService, userService, exerciseService, resourceService){
    <!-- The currently "active" variables used to help set up lists, add new info, ect.  -->
    $rootScope.activeObject = {}
    $rootScope.activeObject.tag = {"name":"Untagged", "id": 0}
    $rootScope.activeObject.topic = {}
    $rootScope.activeObject.exercise = {"id": 0, "question": "blank question", "answer": "blank answer"}
    $rootScope.activeObject.user = {}

    <!-- Controls the visibility of the topics and exercise sections -->
    $scope.showStatus = {}
    $scope.showStatus.topics = true
    $scope.showStatus.exercises = false
    $scope.showStatus.attempts = false

    <!-- Item lists to display on different parts of the page -->
    $scope.dataList = {}
    $scope.dataList.topics = []
    $scope.dataList.tags = []
    $scope.dataList.resources = []
    $scope.dataList.exercises = []

    <!-- Exercise attempts report data.  -->
    $scope.report = {}
    $scope.report.attempts = []


    <!-- Initial setup upon the user having logged in and arrived at the main page.-->
    userService.showUserName($scope)
    categoryService.refreshTagList($scope)


    <!-- Mouse click handling event functions -->
    $scope.tag_click = function(tag_id){
        categoryService.updateTopicsList($scope, tag_id)
        $scope.showStatus.topics = true
        $scope.showStatus.exercises = false
        $scope.showStatus.attempts = false
    }

    $scope.topic_click = function(topicId){
        exerciseService.setupExerciseDisplay($scope, topicId)
    }


    $scope.exerciseClick = function(exercise){
        $rootScope.activeObject.exercise = exercise
        $("#questionModal").modal()
    }

    $scope.showAnswerClick = function(){
        $("#questionModal").modal("hide")
        $("#questionAnswerModal").modal()
    }

    $scope.scoreClick = function(score){
        exerciseService.submitScore($rootScope.activeObject.exercise, score)
        $("#questionAnswerModal").modal("hide")
    }

    $scope.addExerciseClick = function(newQuestion, newAnswer){
        exerciseService.addExercise(newQuestion, newAnswer, $rootScope.activeObject.topic.id)
        exerciseService.setupExerciseDisplay($scope, $rootScope.activeObject.topic.id)
        $scope.newQuestion = ""
        $scope.newAnswer = ""
        // HACK: jQuery workaround due  to question and answer fields falling out of sync with model
        $("#newQuestionId").val("")
        $("#newAnswerId").val("")
    }

    $scope.addResourceClick = function(newResourceName, newResourceUrl){
        resourceService.addResource($scope, newResourceName, newResourceUrl, $rootScope.activeObject.topic.id)
        $scope.newResourceName = ""
        $scope.newResourceUrl = ""
        // HACK: jQuery workaround due  to resource name and url fields falling out of sync with model
        $("#newResourceNameId").val("")
        $("#newResourceUrlId").val("")
    }

    $scope.viewAttemptsClick = function(){
        exerciseService.getAttemptsReport($scope)
    }

}

var addTopicController = function($scope, categoryService){
    $scope.add_topic_click = function(){
        categoryService.addTopicInfo($scope, $scope.new_topic_name, $scope.new_topic_tags)
        categoryService.refreshTagList($scope)
        $scope.new_topic_name = ""
        $scope.new_topic_tags = ""
    }
}

<!-- Core Angular app initialization -->
angular.module("app", [])
    .controller("controller", controller)
    .controller("addTopicController", addTopicController)
    .service("categoryService", CategoryService)
    .service("userService", UserService)
    .service("exerciseService", ExerciseService)
    .service("resourceService", ResourceService)
})()