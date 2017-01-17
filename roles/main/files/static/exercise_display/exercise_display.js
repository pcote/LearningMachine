// Handles the adding events for when users add exercises, click on them, and push buttons that
// rate how they felt they did.
var ExerciseController = function(exerciseService){

    var ec = this;

    // The currently "active" variables used to help set up lists, add new info, ect.
    ec.activeObject = {};
    ec.activeObject.exercise = {"id": 0, "question": "blank question", "answer": "blank answer"};

    // Item lists to display on different parts of the page
    ec.dataList = {};
    ec.dataList.exercises = [];
    ec.dataList.resources = [];

    ec.newinfo = {};
    ec.newinfo.question = "";
    ec.newinfo.answer = "";
    ec.newinfo.caption = "";
    ec.newinfo.url = "";

    ec.charsleft = {};
    ec.charsleft.question = "";
    ec.charsleft.answer = "";
    ec.charsleft.caption = "";
    ec.charsleft.url = "";

    var getExercisesSuccess = function(res){
         ec.dataList.exercises = res.data.exercises;
    };

    var getExercisesFailure = function(res){
    };


    var promise = exerciseService.getExercises();
    promise.then(getExercisesSuccess, getExercisesFailure);




    // add an exercise and update exercise display.  Clear out the exercise addition form and show the latest questions
    // when done.
    ec.addExerciseClick = function(newQuestion, newAnswer){

        var successCallback = function(res){
            var promise = exerciseService.getExercises();
            promise.then(getExercisesSuccess, getExercisesFailure);
        };

        var failureCallback = function(res){};

        var addExercisePromise = exerciseService.addExercise(newQuestion, newAnswer);
        addExercisePromise.then(successCallback, failureCallback);
        ec.newinfo.question = "";
        ec.newinfo.answer = "";
        $("#addExerciseModal").modal("hide");
    };


    // Make sure the right questions show up in the question box.
    ec.exerciseClick = function(exercise){
        ec.activeObject.exercise = exercise;
        $("#questionModal").modal();
    };


    // When user clicks "show answer" in the question box, show the answer in a display they can rate themselves on.
    ec.showAnswerClick = function(){
        $("#questionModal").modal("hide");
        $("#questionAnswerModal").modal();
    };


    // Handle a user rating themselves.  Here, just send the rating to the server
    // and make the question answer box go away.
    ec.scoreClick = function(score){
        var scoreSubmissionPromise = exerciseService.submitScore(ec.activeObject.exercise, score);
        $("#questionAnswerModal").modal("hide");

        scoreSubmissionPromise.then(function(res){
            var promise = exerciseService.getExercises();
            promise.then(getExercisesSuccess);
        });

    };

    ec.deleteExerciseClick = function(exercise_id){
        var successCallback = function(res){
            var promise = exerciseService.getExercises();
            promise.then(getExercisesSuccess, getExercisesFailure);
        };

        var failureCallback = function(res){
            alert("Deletion attempt failed: " + res.data);
        };

        var deleteExercisePromise = exerciseService.deleteExercise(exercise_id);
        deleteExercisePromise.then(successCallback, failureCallback)
    };

    ec.resourceButtonClick = function(exercise){

        var successCallback = function(res){
            ec.dataList.resources = res.data.resources;
            $("#resourceListId").modal();
        };
        var failureCallback = function(res){};

        ec.activeObject.exercise = exercise;
        var promise = exerciseService.reviseLearningResourceList(exercise.id);
        promise.then(successCallback, failureCallback);

    };

    ec.resourceListToResourceModalClick = function(){
        $("#resourceListId").modal("hide");
        $("#addResourceModal").modal();

        var hideAddResourceModal = function(evt){
            ec.newinfo.caption = "";
            ec.newinfo.url = "";
        };

        $("#addResourceModal").on("hide.bs.modal", hideAddResourceModal);
    };

    ec.addLearningResourceClick = function(new_cap, new_url){

        var successCallback = function(res){
            var getResourceSuccess = function(res){
                ec.dataList.resources = res.data.resources;
            };

            var promise = exerciseService.reviseLearningResourceList(ec.activeObject.exercise.id);
            promise.then(getResourceSuccess);
        };

        var failureCallback = function(res){
            alert("failure in adding the resource");
        };

        var promise = exerciseService.addLearningResource(new_cap, new_url, ec.activeObject.exercise.id);
        promise.then(successCallback, failureCallback);

        ec.newinfo.caption = "";
        ec.newinfo.url = "";
        $("#addResourceModal").modal("hide");

    };

    ec.deleteLearningResourceClick = function(resource_id){

        var success = function(res){
            var resourceSuccess = function(res){
                ec.dataList.resources = res.data.resources;
            };

            var promise = exerciseService.reviseLearningResourceList(ec.activeObject.exercise.id);
            promise.then(resourceSuccess);
        };

        var failure = function(res){
            alert("failure in deleting the resource");
        };

        var promise = exerciseService.deleteLearningResource(resource_id);
        promise.then(success, failure);
    };

    ec.updateCharsLeft = function(fieldName, charsLeftDisplay){
        var charsLeft = 140;
        var message = "";

        if(fieldName === "newQuestion"){
            charsLeft = 140 - ec.newinfo.question.length;
        }
        else if(fieldName === "newAnswer"){
            charsLeft = 140 - ec.newinfo.answer.length;
        }
        else if(fieldName === "new_caption_field"){
            charsLeft = 140 - ec.newinfo.caption.length;
        }
        else if(fieldName === "new_url_field"){
            charsLeft = 140 - ec.newinfo.url.length;
        }

        message = charsLeft + " characters left";

        if(charsLeftDisplay === "questionCharsLeft"){
            ec.charsleft.question = message;
        }

        else if(charsLeftDisplay === "answerCharsLeft"){
            ec.charsleft.answer = message;
        }

        else if(charsLeftDisplay === "captionCharsLeft"){
            ec.charsleft.caption = message;
        }

        else if(charsLeftDisplay === "urlCharsLeft"){
            ec.charsleft.url = message;
        }

    };

    ec.allTagsClick = function(){
        var promise = exerciseService.getExercises();
        promise.then(getExercisesSuccess, getExercisesFailure);
    };

    ec.changeTagsClick = function(exercise){
        ec.activeObject.exercise = exercise;
        var tagsAsString = exercise.tags.join(" ");
        $("#tfChangeTags").val(tagsAsString);
        $("#changeTagsModal").modal();
    };

    ec.commitTagChanges = function(exercise, tagChanges){

        var success = function(res){
            var promise = exerciseService.getExercises();
            promise.then(getExercisesSuccess, getExercisesFailure);
        };

        var failure = function(res){
            alert(res.data);
        };


        var promise = exerciseService.changeTags(exercise.id, tagChanges);
        $("#changeTagsModal").modal("hide");
        promise.then(success, failure);
    };

    ec.tagNameClick = function(exerciseID, tagName){
        var promise = exerciseService.getExercisesByTag(tagName);
        promise.then(getExercisesSuccess, getExercisesFailure);
    };

    ec.pasteUrlHandler = function(evt){
        var suggestionSuccess = function(res){
            var suggestedTitle = res.data;
            ec.newinfo.caption = suggestedTitle;
        };

        var suggestionFailure = function(res){
            alert(res.data);
        };

        var clipboardData = evt.originalEvent.clipboardData;
        var data = clipboardData.getData("text/plain");
        data = data.trim();
        var promise = exerciseService.getSuggestedTitle(data);
        promise.then(suggestionSuccess, suggestionFailure);
    };


};


var exerciseDisplay = function(){
    var d = {};
    d.restrict = "E";
    d.scope = {
        show: "="
    };
    d.templateUrl = "/static/exercise_display/exercise_display.html";
    d.controller = "ExerciseController";
    d.controllerAs = "ec";
    return d;
};