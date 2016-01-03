var CategoryService = function($http, $rootScope){

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

        $http(req).then(function(res){
            $http.get("/topics/" + $rootScope.activeObject.tag.id).then(function(res){
                scope.dataList.topics = res.data.topics
            }, function(res){})
        }, function(res){})
    }

    this.refreshTagList = function(scope){
        $http.get("/tags").then(function(res){
            scope.dataList.tags = res.data.tags
        }, function(res){
            alert("referesh of tag list failed")
        })
    }

    this.updateTopicsList = function(scope, tag_id){
        $http.get("/topics/" + tag_id).then(function(res){
            scope.dataList.topics = res.data.topics
        }, function(res){})

        $http.get("/taginfo/" + tag_id).then(function(res){
            $rootScope.activeObject.tag = res.data
        }, function(res){})

    }
}