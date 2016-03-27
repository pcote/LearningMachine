// Exercise Service - Manages info concerning listing of exercises,
// adding new ones, scoring attempts, and getting reports on those attempts.

var ExerciseService = function($http, $rootScope){

    // Setup the display for the main body of the exercise page.
    // Info needed here includes lists of exercises relevant
    // to a given topic.
    this.setupExerciseDisplay = function(scope){

        // grab the exercises
        $http.get("/exercises").then(function(res){
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
    this.addExercise = function(scope, newQuestion, newAnswer){
        var req = {
            url: "/addexercise",
            method: "post",
            headers: {
                "Content-type": "application/json"
            },
            data: {
                    "new_question": newQuestion,
                    "new_answer": newAnswer
            }
        }

        $http(req).then(function(res){
            scope.trigger = !scope.trigger
        }, function(res){})
    }

    this.deleteExercise = function(scope, exercise_id){
        var url = "/deleteexercise"
        var req = {
            url: "/deleteexercise",
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            data: {
                "exercise_id": exercise_id
            }
        }

        var cbSuccess = function(res){
            scope.trigger = !scope.trigger
        }

        var cbFailure = function(res){
            alert("Deletion attempt failed: " + res.data)
        }

        $http(req).then(cbSuccess, cbFailure)
    }

    // Pull the data concerning a user's exercise history into a local json structure
    // that can be displayed in report form.  Also show it.
    this.getAttemptsReport = function(scope){

        var cbSuccess = function(res){
            scope.report.attempts = res.data.history
            scope.showStatus.exercises = false
            scope.showStatus.attempts = true
        }

        var cbFailure = function(res){
            alert("attempt to get the attempt report failed")
        }

        $http.get("/exercisehistory").then(cbSuccess, cbFailure)
    }

    this.reviseLearningResourceList = function(scope, exercise_id){
        var url = "/resourcesforexercise/" + exercise_id
        var cbSuccess = function(res){
            scope.dataList.resources = res.data.resources
            $("#resourceListId").modal()
        }

        var cbFailure = function(res){}
        $http.get(url).then(cbSuccess, cbFailure)
    }

    this.addLearningResource = function(scope, new_cap, new_url, exercise_id){
        var req = {
            url: "/addresource",
            method: "post",
            headers: {
                "Content-type": "application/json"
            },
            data: {
                "new_caption": new_cap,
                "new_url": new_url,
                "exercise_id": exercise_id
            }
        }

        var cb_success = function(){
            var url = "/resourcesforexercise/" + scope.activeObject.exercise.id

            $http.get(url).then(function(res){
                scope.dataList.resources = res.data.resources
            }, function(res){})
        }

        var cb_failure = function(){
            alert("failure in adding the resource")
        }

        $http(req).then(cb_success, cb_failure)
    }

    this.setupLearningResourceDisplay = function(scope){
        var url = "/resourcesforexercise/" + scope.activeObject.exercise.id

        var cb_success = function(res){
            scope.dataList.resources = res.data.resources
        }
        var cb_failure = function(res){
            alert("failure at accessing resources")
        }
        $http.get(url).then(cb_success, cb_failure)
    }

    this.deleteLearningResource = function(scope, resource_id){
        var req = {
            url: "/deleteresource",
            method: "post",
            headers: {
                "Content-type": "application/json"
            },
            data: {
                "resource_id": resource_id
            }
        }

        var cb_success = function(res){
            var url = "/resourcesforexercise/" + scope.activeObject.exercise.id
            $http.get(url).then(function(res){
                scope.dataList.resources = res.data.resources
            }, function(res){})
        }

        var cb_failure = function(res){
            alert("failure in deleting the resource: " + res.data)
        }

        $http(req).then(cb_success, cb_failure)

    }

}
