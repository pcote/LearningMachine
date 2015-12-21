var UserService = function($http){
        this.showUserName = function(scope){
            $http.get("/userinfo").then(function(res){
            scope.displayName = res.data.display_name
        })
    }
}