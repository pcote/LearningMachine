// The main application controller
// Main controller is a container for shared state variables.



(function(){

// Core Angular app initialization
angular.module("app", [])
    .controller("MainController", MainController)
    .controller("ExerciseController", ExerciseController)
    .service("userService", UserService)
    .service("exerciseService", ExerciseService)
    .filter("lmScoreWord", lmScoreWordFilter)
    .directive("exerciseDisplay", exerciseDisplay)
    .directive("attemptsReport", attemptsReport)
    .directive("learningResourceDisplay", learningResourceDisplay)
    .directive("flashmarkApp", flashmarkApp);
})();
