

var ExerciseService = function($http, $rootScope){
    this.setupExerciseDisplay = function(scope, topicId){
        // get the topic name first.
        $http.get("/topicname/" + topicId).then(function(res){
            $rootScope.activeTopicObject = {"id": topicId, "name": res.data.topic_name}
            scope.showTopics = false
            scope.showExercises = true

        }, function(res){})

        // grab the exercises
        $http.get("/exercises/" + topicId).then(function(res){
            scope.exercises = res.data.exercises
        }, function(res){})

        // grab the resources
        $http.get("/resources/" + topicId).then(function(res){
            scope.resources = res.data.resources
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



