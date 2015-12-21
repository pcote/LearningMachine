var CategoryService = function($http){

    this.addTopicInfo = function(topic, stringOfTags){
        var tagList = []
        if(stringOfTags){
            tagList = stringOfTags.split(" ")
        }

        var req = {
            url: "/addtopic",
            method: "post",
            headers: {
                "Content-type":"application/json"
            },
            data: {
                "topic": topic,
                "tags": tagList
            }
        }

        $http(req).then(function(res){}, function(res){})
    }

    this.refreshTagList = function(scope){
        $http.get("/tags").then(function(res){
            scope.tags = res.data.tags
        }, function(res){
            alert("referesh of tag list failed")
        })
    }

    this.updateTopicsList = function(scope, tag_id){
        $http.get("/topics/" + tag_id).then(function(res){
            scope.topics = res.data.topics
        }, function(res){})
    }
}

var ExerciseService = function($http){
    this.setupExerciseDisplay = function(scope, topicId){
        // get the topic name first.
        $http.get("/topicname/" + topicId).then(function(res){
            scope.currentTopic = res.data.topic_name
            scope.currentTopicId = topicId
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

    this.addExercise = function(newQuestion, newAnswer, topic){
        alert("add exercise service stub... question: " + newQuestion + " Anwer: " + newAnswer + " topic: " + topic)
    }
}


var UserService = function($http){
        this.showUserName = function(scope){
            $http.get("/userinfo").then(function(res){
            scope.displayName = res.data.display_name
        })
    }
}
