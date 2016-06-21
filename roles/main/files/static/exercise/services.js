// Exercise Service - Manages info concerning listing of exercises,
// adding new ones, scoring attempts, and getting reports on those attempts.

var ExerciseService = function($http, $rootScope){

    // Setup the display for the main body of the exercise page.
    // Info needed here includes lists of exercises relevant
    // to a given topic.
    this.setupExerciseDisplay = function(scope){

        // grab the exercises
        $http.get("/exercises").then(function(res){
            scope.dataList.exercises = res.data.exercises;
        }, function(res){});

    };

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
        };

        $http(req).then(function(res){}, function(res){});
    };

    // Take the new question and answer pertaining to some topic and store that in the system.
    this.addExercise = function(newQuestion, newAnswer){
        var MAX_CHARS = 140;

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
        };

        if(newQuestion.length <= MAX_CHARS && newAnswer.length <= MAX_CHARS){
            var promise = $http(req);
            return promise;
        }
        else{
            alert("Either the question, answer, or both fail the 140 character max.");
        }
    }

    this.deleteExercise = function(exercise_id){
        var url = "/deleteexercise";
        var req = {
            url: "/deleteexercise",
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            data: {
                "exercise_id": exercise_id
            }
        };

        var promise = $http(req);
        return promise;
    }

    // Pull the data concerning a user's exercise history into a local json structure
    // that can be displayed in report form.  Also show it.
    this.getAttemptsReport = function(){
        var promise = $http.get("/exercisehistory")
        return promise;
    };

    this.reviseLearningResourceList = function(exercise_id){
        var url = "/resourcesforexercise/" + exercise_id;
        var promise = $http.get(url);
        return promise;
    };

    this.addLearningResource = function(new_cap, new_url, exercise_id){
        var MAX_CHARS = 140;
        
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
        };

        if(new_cap.length <= MAX_CHARS && new_url.length <= MAX_CHARS){
            var promise = $http(req);
            return promise;
        }
        else{
            alert("Either the new caption or new url has exceeded the 140 character max limit");
        }
    };

    this.setupLearningResourceDisplay = function(scope){
        var url = "/resourcesforexercise/" + scope.activeObject.exercise.id;

        var cb_success = function(res){
            scope.dataList.resources = res.data.resources;
        };

        var cb_failure = function(res){
            alert("failure at accessing resources");
        };

        $http.get(url).then(cb_success, cb_failure);
    };

    this.deleteLearningResource = function(resource_id){
        var req = {
            url: "/deleteresource",
            method: "post",
            headers: {
                "Content-type": "application/json"
            },
            data: {
                "resource_id": resource_id
            }
        };

        var promise = $http(req);
        return promise;

    };

};
