var UserService = function($http, $rootScope){
        this.showUserName = function(scope){
            $http.get("/userinfo").then(function(res){
            $rootScope.activeObject.user = res.data
        })
    }
}