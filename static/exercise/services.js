// Exercise Service - Manages info concerning listing of exercises,
// adding new ones, scoring attempts, and getting reports on those attempts.

var ExerciseService = function($http, $rootScope){

    // Setup the display for the main body of the exercise page.
    // Info needed here includes lists of exercises relevant
    // to a given topic.
    this.setupExerciseDisplay = function(scope, topicId){

        // get the topic name first.
        $http.get("/topicname/" + topicId).then(function(res){
            $rootScope.activeObject.topic = {"id": topicId, "name": res.data.topic_name}
            scope.showStatus.topics = false
            scope.showStatus.attempts = false
            scope.showStatus.exercises = true

        }, function(res){})

        // grab the exercises
        $http.get("/exercises/").then(function(res){
            scope.dataList.exercises = res.data.exercises
        }, function(res){})

    }

    // Take the score use submitted for the given exercise and report it to the server.
    this.submitScore = function(exercise, score){
        var req = {
            url: "/addscore",
            method: "post",
            headers: {
                "Content-type": "application/json"
            },
            data: {
                "exercise_id": exercise.id,
                "score": score
            }
        }

        $http(req).then(function(res){}, function(res){})
    }

    // Take the new question and answer pertaining to some topic and store that in the system.
    this.addExercise = function(scope, newQuestion, newAnswer, topicId){
        var req = {
            url: "/addexercise",
            method: "post",
            headers: {
                "Content-type": "application/json"
            },
            data: {
                    "new_question": newQuestion,
                    "new_answer": newAnswer,
                    "topic_id": topicId
            }
        }

        $http(req).then(function(res){
            scope.trigger = !scope.trigger
        }, function(res){})
    }

    // Pull the data concerning a user's exercise history into a local json structure
    // that can be displayed in report form.  Also show it.
    this.getAttemptsReport = function(scope){

        var cbSuccess = function(res){
            scope.report.attempts = res.data.history
            scope.showStatus.topics = false
            scope.showStatus.exercises = false
            scope.showStatus.attempts = true
        }

        var cbFailure = function(res){
            alert("attempt to get the attempt report failed")
        }

        $http.get("/exercisehistory").then(cbSuccess, cbFailure)
    }
}

