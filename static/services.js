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

var UserService = function($http){
        this.showUserName = function(scope){
            $http.get("/userinfo").then(function(res){
            scope.displayName = res.data.display_name
        })
    }
}