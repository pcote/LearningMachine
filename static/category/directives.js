var lmTagList = function(categoryService){
    var d = {}
    d.restrict = "E"
    d.scope = {
    }

    d.templateUrl = "/static/category/tag_list.html"

    d.link = function(scope, elem, attrs){
        categoryService.refreshTagList(scope)
    }

    return d
}