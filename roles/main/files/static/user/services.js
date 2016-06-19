// Service for grabbing relevant information about the user for sake of display purposes.

var UserService = function($http, $rootScope){

        // Grab the user data from server and set it to where it can be grabbed by the template and displayed.
        this.showUserName = function(scope){
            $http.get("/userinfo").then(function(res){
                scope.displayName = res.data.displayName

        })
    }
}