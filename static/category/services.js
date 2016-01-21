var CategoryService = function($http, $rootScope){

// Service for managing topic categories and the tags that get associated with them.

    // Send a request to submit topics and a list of tags to connect to that topic.
    this.addTopicInfo = function(scope, topic, stringOfTags){

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

        // First http request submits the new topic and tag info to the server.
        // Once done, the callback makes a second http request to get the latest topic data.
        $http(req).then(function(res){
            $http.get("/topics/" + $rootScope.activeObject.tag.id).then(function(res){
                scope.dataList.topics = res.data.topics
            }, function(res){})
        }, function(res){})
    }

    // Gets the latest set of tags from the server to be ultimately displayed on the side in the tag list.
    this.refreshTagList = function(scope){
        $http.get("/tags").then(function(res){
            scope.dataList.tags = res.data.tags
        }, function(res){
            alert("referesh of tag list failed")
        })
    }

    // Get the latest topic info from the server concerning topics that happen to be associated with
    // the given tag.
    this.updateTopicsList = function(scope, tag_id){
        $http.get("/topics/" + tag_id).then(function(res){
            scope.dataList.topics = res.data.topics
        }, function(res){})

        $http.get("/taginfo/" + tag_id).then(function(res){
            $rootScope.activeObject.tag = res.data
        }, function(res){})

    }
}