

var ExerciseService = function($http, $rootScope){
    this.setupExerciseDisplay = function(scope, topicId){
        // get the topic name first.
        $http.get("/topicname/" + topicId).then(function(res){
            $rootScope.activeObject.topic = {"id": topicId, "name": res.data.topic_name}
            scope.showStatus.topics = false
            scope.showStatus.exercises = true

        }, function(res){})

        // grab the exercises
        $http.get("/exercises/" + topicId).then(function(res){
            scope.dataList.exercises = res.data.exercises
        }, function(res){})

        // grab the resources
        $http.get("/resources/" + topicId).then(function(res){
            scope.dataList.resources = res.data.resources
        }, function(res){})
    }

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

    this.addExercise = function(newQuestion, newAnswer, topicId){
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

        $http(req).then(function(res){}, function(res){})
    }
}

var ResourceService = function($http, $rootScope){

    this.addResource = function(scope, name, url, topic_id){
        var req = {
            url: "/addresource",
            method: "post",
            headers: {
                "Content-type": "application/json"
            },
            data: {
                "new_resource_name": name,
                "new_resource_url": url,
                "topic_id": topic_id
            }
        }

        var cbAddResourceSuccess = function(res){
            // grab the resources
            $http.get("/resources/" + topic_id).then(function(res){
                scope.dataList.resources = res.data.resources
            }, function(res){})

        }

        var cbAddResourceFail = function(res){
            alert("attempt to add resource bombed.  check the stacktrace")
        }

        $http(req).then(cbAddResourceSuccess, cbAddResourceFail)
    }
}



